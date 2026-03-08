import { pool, generateId } from "./db";

export const TOKEN_COSTS = {
    GENERATE: 5,
    REWRITE: 2,
    IMPROVE: 1,
};

export async function getTokenBalance(userId: string): Promise<number> {
    const result = await pool.query(
        'SELECT tokens FROM "User" WHERE id = $1',
        [userId]
    );
    return parseInt(result.rows[0]?.tokens) || 0;
}

export async function deductTokens(
    userId: string,
    amount: number
): Promise<{ success: boolean; remaining: number }> {
    const result = await pool.query(
        'SELECT tokens FROM "User" WHERE id = $1',
        [userId]
    );

    const user = result.rows[0];
    if (!user || user.tokens < amount) {
        return { success: false, remaining: user?.tokens ?? 0 };
    }

    const updated = await pool.query(
        'UPDATE "User" SET tokens = tokens - $1, "updatedAt" = NOW() WHERE id = $2 RETURNING tokens',
        [amount, userId]
    );

    return { success: true, remaining: parseInt(updated.rows[0].tokens) || 0 };
}

export async function addTokens(
    userId: string,
    amount: number
): Promise<number> {
    const updated = await pool.query(
        'UPDATE "User" SET tokens = tokens + $1, "updatedAt" = NOW() WHERE id = $2 RETURNING tokens',
        [amount, userId]
    );

    return parseInt(updated.rows[0].tokens) || 0;
}
