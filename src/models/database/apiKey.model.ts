import { query } from './database';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export interface ApiKey {
  id?: number;
  key: string;
  name?: string;
  tier: 'free' | 'paid' | 'premium';
  monthly_limit: number;
  current_usage: number;
  created_at?: Date;
  expires_at?: Date;
  is_active: boolean;
}

export class ApiKeyModel {
  static async create(data: {
    name?: string;
    tier?: 'free' | 'paid' | 'premium';
    monthlyLimit?: number;
    expiresAt?: Date;
  }): Promise<{ apiKey: ApiKey; plainKey: string }> {
    const plainKey = this.generateApiKey();
    const hashedKey = await bcrypt.hash(plainKey, 10);
    
    const tier = data.tier || 'free';
    const monthlyLimit = data.monthlyLimit || this.getDefaultLimit(tier);
    
    const text = `
      INSERT INTO api_keys (key, name, tier, monthly_limit, expires_at, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      hashedKey,
      data.name || 'Unnamed Key',
      tier,
      monthlyLimit,
      data.expiresAt || null,
      true,
    ];
    
    const result = await query(text, values);
    return {
      apiKey: result.rows[0],
      plainKey: plainKey,
    };
  }

  static async findByKey(plainKey: string): Promise<ApiKey | null> {
    const text = `SELECT * FROM api_keys WHERE is_active = true`;
    const result = await query(text);
    
    for (const row of result.rows) {
      const isMatch = await bcrypt.compare(plainKey, row.key);
      if (isMatch) {
        if (row.expires_at && new Date(row.expires_at) < new Date()) {
          await this.deactivate(row.id);
          return null;
        }
        return row;
      }
    }
    
    return null;
  }

  static async incrementUsage(id: number, amount: number = 1): Promise<void> {
    const text = `
      UPDATE api_keys 
      SET current_usage = current_usage + $2
      WHERE id = $1
    `;
    await query(text, [id, amount]);
  }

  static async resetUsage(id: number): Promise<void> {
    const text = `
      UPDATE api_keys 
      SET current_usage = 0
      WHERE id = $1
    `;
    await query(text, [id]);
  }

  static async resetAllUsage(): Promise<void> {
    const text = `UPDATE api_keys SET current_usage = 0`;
    await query(text);
  }

  static async deactivate(id: number): Promise<void> {
    const text = `
      UPDATE api_keys 
      SET is_active = false
      WHERE id = $1
    `;
    await query(text, [id]);
  }

  static async updateTier(
    id: number,
    tier: 'free' | 'paid' | 'premium'
  ): Promise<void> {
    const monthlyLimit = this.getDefaultLimit(tier);
    const text = `
      UPDATE api_keys 
      SET tier = $2, monthly_limit = $3
      WHERE id = $1
    `;
    await query(text, [id, tier, monthlyLimit]);
  }

  static async getUsageStats(id: number): Promise<{
    tier: string;
    monthlyLimit: number;
    currentUsage: number;
    remainingCalls: number;
    percentUsed: number;
  } | null> {
    const text = `
      SELECT tier, monthly_limit, current_usage 
      FROM api_keys 
      WHERE id = $1 AND is_active = true
    `;
    const result = await query(text, [id]);
    
    if (result.rows.length === 0) return null;
    
    const { tier, monthly_limit, current_usage } = result.rows[0];
    const remainingCalls = Math.max(0, monthly_limit - current_usage);
    const percentUsed = (current_usage / monthly_limit) * 100;
    
    return {
      tier,
      monthlyLimit: monthly_limit,
      currentUsage: current_usage,
      remainingCalls,
      percentUsed: Math.round(percentUsed * 100) / 100,
    };
  }

  static async findExpiredKeys(): Promise<ApiKey[]> {
    const text = `
      SELECT * FROM api_keys 
      WHERE expires_at IS NOT NULL 
        AND expires_at < NOW() 
        AND is_active = true
    `;
    const result = await query(text);
    return result.rows;
  }

  private static generateApiKey(): string {
    const uuid = uuidv4().replace(/-/g, '');
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 10);
    return `bca_${uuid}${timestamp}${randomStr}`;
  }

  private static getDefaultLimit(tier: 'free' | 'paid' | 'premium'): number {
    const limits = {
      free: 1000,
      paid: 10000,
      premium: 100000,
    };
    return limits[tier];
  }
}