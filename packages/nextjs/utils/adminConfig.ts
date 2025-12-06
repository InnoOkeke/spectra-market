/**
 * Admin Configuration
 * Add admin wallet addresses here
 */

export const ADMIN_ADDRESSES = [
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // Hardhat default account #0
  // Add your admin wallet addresses here
  // '0x1234567890123456789012345678901234567890',
];

/**
 * Check if an address is an admin
 */
export function isAdmin(address: string | undefined): boolean {
  if (!address) return false;
  return ADMIN_ADDRESSES.some(
    admin => admin.toLowerCase() === address.toLowerCase()
  );
}
