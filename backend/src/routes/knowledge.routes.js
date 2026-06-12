const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { v4: uuidv4 } = require("uuid");

const KnowledgeFile = require("../models/KnowledgeFile");
const KnowledgeChunk = require("../models/KnowledgeChunk");

const knowledgeService = require("../services/knowledge.service");
const chunkerService = require("../services/chunker.service");

const storage = multer.diskStorage({

  destination(req, file, cb) {

    const dir = "./uploads/knowledge";

    if (!fs.existsSync(dir)) {

      fs.mkdirSync(dir, { recursive: true });

    }

    cb(null, dir);

  },

  filename(req, file, cb) {

    cb(

      null,

      uuidv4() + path.extname(file.originalname)

    );

  }

});

const upload = multer({

  storage

});

router.post(

  "/upload",

  upload.single("file"),

  async (req, res) => {

    try {

      if (!req.file) {

        return res.status(400).json({

          message: "No file uploaded"

        });

      }

      const extractedText = await knowledgeService.extractText(

        req.file.path,

        req.file.mimetype

      );

      const chunks = chunkerService.chunkText(

        extractedText

      );

      const knowledgeFile = await KnowledgeFile.create({

        filename: req.file.filename,

        originalName: req.file.originalname,

        mimeType: req.file.mimetype,

        size: req.file.size,

        status: "completed",

        totalChunks: chunks.length

      });

      for (let i = 0; i < chunks.length; i++) {

        await KnowledgeChunk.create({

          fileId: knowledgeFile._id,

          chunkIndex: i,

          text: chunks[i],

          embedding: []

        });

      }

      res.json({

        success: true,

        file: knowledgeFile,

        chunks: chunks.length

      });

    }

    catch (err) {

      console.error(err);

      res.status(500).json({

        message: err.message

      });

    }

  }

);

router.get(

  "/",

  async (req, res) => {

    const files = await KnowledgeFile.find()

      .sort({

        createdAt: -1

      });

    res.json(files);

  }

);

router.delete(

  "/:id",

  async (req, res) => {

    await KnowledgeChunk.deleteMany({

      fileId: req.params.id

    });

    await KnowledgeFile.findByIdAndDelete(

      req.params.id

    );

    res.json({

      success: true

    });

  }

);

module.exports = router;
