import { User } from "../models/User";

const users: User[] = <User[]>[
  <User>{
    name: "Admin",
    email: "admin@admin.com",
    password: "admin@123",
    role: "ADMIN",
  },
  <User>{
    name: "User",
    email: "user@user.com",
    password: "user@123",
    role: "USER",
  },
];

export default users;
