export const UserRole = {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
  SUPPLIER: 'SUPPLIER',
  SUPPORT_STAFF: 'SUPPORT_STAFF',
};

export const UserRoleLabels = {
  [UserRole.ADMIN]: 'Administrator',
  [UserRole.CUSTOMER]: 'Customer',
  [UserRole.SUPPLIER]: 'Supplier',
  [UserRole.SUPPORT_STAFF]: 'Support Staff',
};

export const UserRoleOptions = [
  { value: UserRole.CUSTOMER, label: UserRoleLabels[UserRole.CUSTOMER] },
  { value: UserRole.SUPPLIER, label: UserRoleLabels[UserRole.SUPPLIER] },
];

export const ApiResponse = {
  success: (message, data) => ({
    success: true,
    message,
    data,
  }),
  error: (message) => ({
    success: false,
    message,
    data: null,
  }),
};
