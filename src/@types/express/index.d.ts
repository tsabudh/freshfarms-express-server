import express from "express";

declare global {
  namespace Express {
    interface Locals {
      currentUser?: string;
      userRole?: string;
    }
  }
}