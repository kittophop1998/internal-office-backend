import { db } from "./maria";

async function seed() {
    try {
        console.log('Starting database seeding...');

        // Seed Branches
        console.log('Seeding branches...');
        const branchCountResult = await db
            .selectFrom('branches')
            .select(db.fn.count<number>('id').as('count'))
            .executeTakeFirst();
        const branchCount = branchCountResult ? Number(branchCountResult.count) : 0;

        if (branchCount === 0) {
            await db
                .insertInto('branches')
                .values([
                    {
                        "name": "Main store (โกดัง 40)",
                        "location": "Main store (โกดัง 40)",
                        "updated_at": new Date()
                    },
                    {
                        "name": "ONLINE (STO)",
                        "location": "ONLINE (STO)",
                        "updated_at": new Date()
                    },
                    {
                        "name": "100 Baht Shop (JJ1)",
                        "location": "100 Baht Shop (JJ1)",
                        "updated_at": new Date()
                    },
                    {
                        "name": "100 Baht Shop (JJ2)",
                        "location": "100 Baht Shop (JJ2)",
                        "updated_at": new Date()
                    },
                    {
                        "name": "Checkin Lowprice (CL)",
                        "location": "Checkin Lowprice (CL)",
                        "updated_at": new Date()
                    },
                    {
                        "name": "100 Baht Shop (PTN)",
                        "location": "100 Baht Shop (PTN)",
                        "updated_at": new Date()
                    },
                    {
                        "name": "100 Baht Shop (KB)",
                        "location": "100 Baht Shop (KB)",
                        "updated_at": new Date()
                    },
                    {
                        "name": "100 Baht Shop (CBR)",
                        "location": "100 Baht Shop (CBR)",
                        "updated_at": new Date()
                    },
                    {
                        "name": "ศรีฟ้า",
                        "location": "ศรีฟ้า",
                        "updated_at": new Date()
                    },
                    {
                        "name": "100BAHTSHOP (SAMUI)",
                        "location": "100BAHTSHOP (SAMUI)",
                        "updated_at": new Date()
                    },
                    {
                        "name": "DRUG CENTER SAMUI",
                        "location": "DRUG CENTER SAMUI",
                        "updated_at": new Date()
                    },
                    {
                        "name": "100 Baht Shop (MPN)",
                        "location": "100 Baht Shop (MPN)",
                        "updated_at": new Date()
                    },
                    {
                        "name": "_DEMO หน้าร้าน",
                        "location": "_DEMO หน้าร้าน",
                        "updated_at": new Date()
                    },
                    {
                        "name": "100 Baht Shop (JJ3)",
                        "location": "100 Baht Shop (JJ3)",
                        "updated_at": new Date()
                    },
                    {
                        "name": "100 Baht Shop (JJ5)",
                        "location": "100 Baht Shop (JJ5)",
                        "updated_at": new Date()
                    },
                    {
                        "name": "_DEMO คลังใหญ่",
                        "location": "_DEMO คลังใหญ่",
                        "updated_at": new Date()
                    },
                    {
                        "name": "Chemist Pharmacy (CMP)",
                        "location": "Chemist Pharmacy (CMP)",
                        "updated_at": new Date()
                    },
                    {
                        "name": "สำนักงานใหญ่",
                        "location": "สำนักงานใหญ่",
                        "updated_at": new Date()
                    },
                    {
                        "name": "ราคาแนะนำขาย Sticker price",
                        "location": "ราคาแนะนำขาย Sticker price",
                        "updated_at": new Date()
                    },
                    {
                        "name": "100 Baht Shop (JJ8)",
                        "location": "100 Baht Shop (JJ8)",
                        "updated_at": new Date()
                    },
                    {
                        "name": "ห้องผลิตสินค้า OTOP",
                        "location": "ห้องผลิตสินค้า OTOP",
                        "updated_at": new Date()
                    },
                    {
                        "name": "โกดังคืนสินค้า",
                        "location": "โกดังคืนสินค้า",
                        "updated_at": new Date()
                    },
                    {
                        "name": "100 Baht Shop (JF1)",
                        "location": "100 Baht Shop (JF1)",
                        "updated_at": new Date()
                    },
                    {
                        "name": "100 Baht Shop (ITS)",
                        "location": "100 Baht Shop (ITS)",
                        "updated_at": new Date()
                    },
                    {
                        "name": "Chemist Pharmacy (SBY)",
                        "location": "Chemist Pharmacy (SBY)",
                        "updated_at": new Date()
                    },
                    {
                        "name": "100 Baht Shop (MPN2)",
                        "location": "100 Baht Shop (MPN2)",
                        "updated_at": new Date()
                    },
                    {
                        "name": "100 Baht Shop (SPL)",
                        "location": "100 Baht Shop (SPL)",
                        "updated_at": new Date()
                    },
                    {
                        "name": "100 Baht Shop (JJP)",
                        "location": "100 Baht Shop (JJP)",
                        "updated_at": new Date()
                    },
                    {
                        "name": "100 Baht Shop (SSK)",
                        "location": "100 Baht Shop (SSK)",
                        "updated_at": new Date()
                    }
                ])
                .execute();
            console.log('Branches seeded successfully.');
        }

        // Seed Positions
        console.log('Seeding roles...');
        const roleCountResult = await db
            .selectFrom('roles')
            .select(db.fn.count<number>('id').as('count'))
            .executeTakeFirst();
        const roleCount = roleCountResult ? Number(roleCountResult.count) : 0;

        if (roleCount === 0) {
            await db
                .insertInto('roles')
                .values([
                    {
                        "code": "ADMIN",
                        "name": "Administrator",
                        "description": "System Administrator",
                        "updated_at": new Date()
                    },
                    {
                        "code": "MANAGER",
                        "name": "Manager",
                        "description": "Department Manager",
                        "updated_at": new Date()
                    },
                    {
                        "code": "STAFF",
                        "name": "Staff",
                        "description": "General Staff Member",
                        "updated_at": new Date()
                    },
                    {
                        "code": "CASHIER",
                        "name": "Cashier",
                        "description": "Handles cash transactions",
                        "updated_at": new Date()
                    },
                    {
                        "code": "SALE",
                        "name": "Sales",
                        "description": "Handles sales transactions",
                        "updated_at": new Date()
                    },
                ])
                .execute();
            console.log('Roles seeded successfully.');
        }

        // Seed Departments
        console.log('Seeding departments...');
        const departmentCountResult = await db
            .selectFrom('departments')
            .select(db.fn.count<number>('id').as('count'))
            .executeTakeFirst();
        const departmentCount = departmentCountResult ? Number(departmentCountResult.count) : 0;

        if (departmentCount === 0) {
            await db
                .insertInto('departments')
                .values([
                    {
                        "name": "Human Resources",
                        "description": "Handles recruitment, training, and employee relations.",
                        "updated_at": new Date()
                    },
                    {
                        "name": "Finance",
                        "description": "Manages financial planning, budgeting, and accounting.",
                        "updated_at": new Date()
                    },
                    {
                        "name": "IT",
                        "description": "Responsible for technology infrastructure and support.",
                        "updated_at": new Date()
                    }
                ])
                .execute();
            console.log('Departments seeded successfully.');
        }

        console.log('Database seeding completed.');
    } catch (error) {
        console.error('Error during seeding:', error);
        throw error;
    }
}

if (require.main === module) {
    seed()
        .then(() => {
            console.log('Seed completed')
            process.exit(0)
        })
        .catch((error) => {
            console.error('Seed failed:', error)
            process.exit(1)
        })
}

export { seed }