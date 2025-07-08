import React from "react";
import DataGridTemplate from "./DataGridTemplate";

const Modules = (props) => {
  console.log("props", props);
  const { activeSubComponent } = props;
  const lowerCaseActiveSubComponent = activeSubComponent
    ? activeSubComponent.toLowerCase().replace(/\s/g, "")
    : "";

  console.log("propdddds", lowerCaseActiveSubComponent);
  const userConfig = {
    title: activeSubComponent,
    fetchFieldApiUrl: `http://localhost:5000/api/get_document_by_collection/${lowerCaseActiveSubComponent}`,
    fetchActualData: `http://localhost:5000/api/fetch_doc/${lowerCaseActiveSubComponent}`,
    postApiUrl: "http://localhost:5000/api/save_doc",
    updateApiUrl: "http://localhost:5000/api/update_doc",
    collectionName: lowerCaseActiveSubComponent,
  };

  return <DataGridTemplate {...userConfig} />;
};

export default Modules;
