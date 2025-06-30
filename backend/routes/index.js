const express = require("express");
const app = express();
const router = express.Router();

const userController = require("../controller/userController");
const botController = require("../controller/botTypeController");
const loginController = require("../controller/loginController");
const loginRateLimiter = require("../middileware/raeLimit");
const functionalAreaontroller = require("../controller/functionalAreaController");
const collectionController = require("../controller/collectionController");
const moduleController = require("../controller/moduleController");
const documentController = require("../controller/documentController");
const documentTemplateController = require("../controller/documentTemplatecontroller");
const auth = require("../middileware/auth");
router.get("/status", (req, res) => {
  res.send("welcome to bots");
});
//login api
router.post("/users/register", userController.registerUser);
router.post("/login", loginController.loginUser);

//function area api
router.get(
  "/function_area/:id",
  functionalAreaontroller.getFuntinalAreaDetails
);
router.get("/function_area", functionalAreaontroller.getAllFunctionAreas);
router.get(
  "/each_funarea_documents/:faId",
  functionalAreaontroller.getEachFuntinalAreaDetails
);
router.post("/save_function_area", functionalAreaontroller.saveFunctionArea);
//--------------------------------------------------
router.get(
  "/schema_deatils/:collectionName",
  functionalAreaontroller.schemaDeatils
);

router.get("/bot_types", botController.getBotDetails);
router.post(
  "/collections/add-field",
  collectionController.addNewFieldtoCollection
);
// document api
router.get("/document_list", documentController.getDocumentList);
router.post("/save_document", documentController.saveDocument);
// modules api
router.post("/save_module", moduleController.saveModule);
router.get("/get_each_module/:moduleId", moduleController.getEachModule);
router.get("/modules", moduleController.getModulesDetails);

//document template api
router.post(
  "/save_document_template",
  documentTemplateController.saveDocumentTemplateList
);
router.get(
  "/get_document/:docName",
  documentTemplateController.getEachDocumentData
);
router.get(
  "/get_document_by_collection/:collectionName",
  documentTemplateController.getDocumentByCollection
);
module.exports = router;
