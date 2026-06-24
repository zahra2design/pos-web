export const ROLES = {
  OWNER: "owner",
  MANAGER: "manager",
  CASHIER: "cashier",
  BARISTA: "barista",
  INVENTORY_STAFF: "inventory_staff",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.OWNER]: "Owner",
  [ROLES.MANAGER]: "Manager",
  [ROLES.CASHIER]: "Kasir",
  [ROLES.BARISTA]: "Barista",
  [ROLES.INVENTORY_STAFF]: "Inventory Staff",
};

export const ROLE_MENU_ACCESS: Record<Role, string[]> = {
  [ROLES.OWNER]: [
    "dashboard",
    "products",
    "pos",
    "kds",
    "inventory",
    "customers",
    "reports",
    "settings",
  ],
  [ROLES.MANAGER]: [
    "dashboard",
    "products",
    "pos",
    "kds",
    "inventory",
    "customers",
    "reports",
  ],
  [ROLES.CASHIER]: ["pos", "customers"],
  [ROLES.BARISTA]: ["kds"],
  [ROLES.INVENTORY_STAFF]: ["inventory"],
};
