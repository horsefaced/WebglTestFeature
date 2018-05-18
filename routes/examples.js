const express = require('express');
const router = express.Router();

router.get('/xeogl', (req, res, next) => {
    res.render('xeogl');
});

router.get('/cesium', (req, res, next) => {
    res.render('cesium');
});

router.get('/cesium/:name', (req, res, next) => {
    res.render('cesium/' + req.params['name']);
});

router.get('/three', (req, res, next) => {
    res.render('three');
});

module.exports = router; 