import mongoose from 'mongoose';

import express from 'express';

import { createContract, getAllContracts } from '../controllers/contractController';

const router = express.Router();

router.route("/").get(getAllContracts).post(createContract);


export default router;