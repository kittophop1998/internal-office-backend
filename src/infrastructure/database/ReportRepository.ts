import { IReportRepository } from "../../application/repositories/reportRepo";
import { db } from "./maria";

export class ReportRepository implements IReportRepository {
    /**
     * getUserReport
     *
     * ดึงรายงานสรุปของ user คนเดียว จัดกลุ่มตาม task_group
     *
     * การคำนวณ:
     *   - ดึง task ทั้งหมดในแต่ละ group (ไม่ว่า user จะทำหรือไม่)
     *   - ดึง task_sessions ของ user เพื่อดูสถานะ
     *   - approved_count  = จำนวน task ที่ status = 'APPROVED' ใน group นั้น
     *   - total_count     = จำนวน task ทั้งหมดใน group นั้น
     *   - rating          = (approved_count / total_count) * group.rating_criteria
     *   - score           = group.percent_weight * rating
     *   - overall rating  = sum(score) / sum(percent_weight)
     *   - overall percent = sum(score) / sum(percent_weight * rating_criteria) * 100
     *
     * filter รับ:
     *   - type     : 'DAILY' | 'WEEKLY' | 'MONTHLY'
     *   - branchId : number
     *   - date     : 'YYYY-MM-DD'
     */
    async getUserReport(userId: number, filter: any): Promise<any> {
        // ── 1. ดึงชื่อ user ───────────────────────────────────────────────────
        let userQuery = db
            .selectFrom("users")
            .select(["users.id", "users.full_name"])
            .where("users.id", "=", userId)
            .where("users.deleted_at", "is", null);

        if (filter.branchId) {
            userQuery = userQuery
                .innerJoin("user_branches", "user_branches.user_id", "users.id")
                .where("user_branches.branch_id", "=", filter.branchId)
                .where("user_branches.deleted_at", "is", null) as any;
        }

        const user = await userQuery.executeTakeFirst();

        if (!user) {
            return null;
        }

        // ── 2. ดึง task ทั้งหมดพร้อม group (เป็น baseline ว่ามีกี่ task) ─────
        let taskQuery = db
            .selectFrom("tasks")
            .innerJoin("task_groups", "tasks.group_id", "task_groups.id")
            .where("tasks.deleted_at", "is", null)
            .where("task_groups.deleted_at", "is", null);

        if (filter.type) {
            taskQuery = taskQuery.where("tasks.type", "=", filter.type);
        }

        const allTasks = await taskQuery
            .select([
                "tasks.id as taskId",
                "tasks.title as taskTitle",
                "tasks.weight as taskWeight",
                "tasks.sort_order as sortOrder",
                "task_groups.id as groupId",
                "task_groups.name as groupName",
                "task_groups.percent_weight as groupPercentWeight",
                "task_groups.rating_criteria as ratingCriteria"
            ])
            .orderBy("task_groups.id", "asc")
            .orderBy("tasks.sort_order", "asc")
            .execute();

        if (allTasks.length === 0) {
            return {
                name: user.full_name,
                overall_crittical_task_rating: { percent: 0, rating: "0.0" },
                tasksReports: []
            };
        }

        // ── 3. ดึง task_sessions ของ user เพื่อดูสถานะ ───────────────────────
        const taskIds = allTasks.map((t) => t.taskId);

        let sessionQuery = db
            .selectFrom("task_sessions")
            .where("task_sessions.user_id", "=", userId)
            .where("task_sessions.task_id", "in", taskIds)
            .where("task_sessions.deleted_at", "is", null);

        if (filter.type) {
            sessionQuery = sessionQuery.where("task_sessions.type", "=", filter.type);
        }

        if (filter.branchId) {
            sessionQuery = sessionQuery.where("task_sessions.branch_id", "=", filter.branchId);
        }

        if (filter.date) {
            sessionQuery = sessionQuery.where("task_sessions.session_date", "=", filter.date);
        }

        const sessions = await sessionQuery
            .select([
                "task_sessions.task_id as taskId",
                "task_sessions.status"
            ])
            .execute();

        // map taskId → status (เอาแค่ session ล่าสุดต่อ task)
        const sessionStatusMap: Record<number, string> = {};
        for (const s of sessions) {
            sessionStatusMap[s.taskId] = s.status;
        }

        // ── 4. จัดกลุ่มตาม task_group ────────────────────────────────────────
        type GroupAccum = {
            groupId: number;
            groupName: string;
            groupPercentWeight: number;
            ratingCriteria: number;
            tasks: {
                taskId: number;
                title: string;
                taskWeight: number;
                sortOrder: number;
                status: string;
            }[];
        };

        const groupMap: Record<number, GroupAccum> = {};

        for (const t of allTasks) {
            if (!groupMap[t.groupId]) {
                groupMap[t.groupId] = {
                    groupId: t.groupId,
                    groupName: t.groupName,
                    groupPercentWeight: t.groupPercentWeight,
                    ratingCriteria: t.ratingCriteria,
                    tasks: []
                };
            }
            groupMap[t.groupId].tasks.push({
                taskId: t.taskId,
                title: t.taskTitle,
                taskWeight: t.taskWeight,
                sortOrder: t.sortOrder,
                status: sessionStatusMap[t.taskId] ?? "PENDING"
            });
        }

        // ── 5. คำนวณ rating / score ต่อ group ────────────────────────────────
        //
        //  approved_count = จำนวน task ที่ APPROVED ใน group
        //  total_count    = จำนวน task ทั้งหมดใน group
        //  rating         = (approved_count / total_count) * ratingCriteria
        //  score          = percent_weight * rating

        let totalWeightSum = 0;
        let totalScoreSum = 0;
        let maxScoreSum = 0;  // สำหรับคิด percent = totalScoreSum / maxScoreSum * 100

        const tasksReports = Object.values(groupMap).map((group) => {
            const totalCount = group.tasks.length;
            const approvedCount = group.tasks.filter((t) => t.status === "APPROVED").length;

            const rating = totalCount > 0
                ? parseFloat(((approvedCount / totalCount) * group.ratingCriteria).toFixed(2))
                : 0;

            const score = parseFloat(((group.groupPercentWeight / 100) * rating).toFixed(4));

            totalWeightSum += group.groupPercentWeight;
            totalScoreSum += score;
            maxScoreSum += group.groupPercentWeight * group.ratingCriteria;

            return {
                name: group.groupName,
                weight: group.groupPercentWeight,
                rating: rating.toFixed(1),
                score
            };
        });

        // ── 6. overall ────────────────────────────────────────────────────────
        const overallRating = totalWeightSum > 0
            ? parseFloat((totalScoreSum / totalWeightSum).toFixed(2))
            : 0;

        const overallPercent = maxScoreSum > 0
            ? parseFloat((totalScoreSum / maxScoreSum * 100).toFixed(2))
            : 0;

        return {
            name: user.full_name,
            overall_crittical_task_rating: {
                percent: overallPercent,
                rating: overallRating.toFixed(1)
            },
            tasksReports
        };
    }
}