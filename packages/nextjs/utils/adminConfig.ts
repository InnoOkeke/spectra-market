/**
 * Admin Configuration
 * Add admin wallet addresses here
 */

export const ADMIN_ADDRESSES = [
  "0x6C8c3FC2717cE887B41E85141B7ACd7e0a197946", // Production admin
];

/**
 * Check if an address is an admin
 */
export function isAdmin(address: string | undefined): boolean {
  if (!address) return false;
  return ADMIN_ADDRESSES.some(admin => admin.toLowerCase() === address.toLowerCase());
}
