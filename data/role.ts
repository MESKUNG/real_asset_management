export type Role = {
  id: number;
  name: string;
};

export const roles: Role[] = [
  { id: 1, name: "User" },
  { id: 2, name: "Admin" },
  { id: 3, name: "President" },
  { id: 4, name: "Superadmin" },
];
