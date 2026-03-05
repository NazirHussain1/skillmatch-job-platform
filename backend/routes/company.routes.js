const express = require('express');
const {
  getCompanyProfile,
  getAllCompanies
} = require('../controllers/company.controller');

const router = express.Router();

router.get('/', getAllCompanies);
router.get('/:id', getCompanyProfile);

module.exports = router;
