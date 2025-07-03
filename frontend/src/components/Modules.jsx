import React from "react";
import DataGridTemplate from "./DataGridTemplate";

const Modules = () => {
  let collectionName = "modules";
  const userConfig = {
    title: "Modules",
    fetchFieldApiUrl: `http://localhost:5000/api/get_document_by_collection/${collectionName}`,
    fetchActualData: "http://localhost:5000/api/modules",
    postApiUrl: "http://localhost:5000/api/save_module",
    updateApiUrl: "http://localhost:5000/api/update_module",
    collectionName: "modules",
  };

  return <DataGridTemplate {...userConfig} />;
};

export default Modules;
