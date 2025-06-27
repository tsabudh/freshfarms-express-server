export {};

declare global {
  namespace Express {
    interface Locals {
      currentUser?: string;
      userRole?: string;
    }
  }
}
