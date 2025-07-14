import React from "react";
import DataGridTemplate from "./DataGridTemplate";

const Modules = (props) => {
  console.log("props", props);
  const { activeSubComponent } = props;
  const lowerCaseActiveSubComponent = activeSubComponent
    ? activeSubComponent.toLowerCase().replace(/\s/g, "")
    : "";
  const userConfig = {
    title: activeSubComponent,
    fetchFieldApiUrl: `http://localhost:5000/api/get_document_by_docname/${activeSubComponent}`,
    fetchActualData: `http://localhost:5000/api/fetch_doc/${activeSubComponent}`,
    postApiUrl: "http://localhost:5000/api/save_doc",
    updateApiUrl: "http://localhost:5000/api/update_doc",
    docName: activeSubComponent,
    collectionName: lowerCaseActiveSubComponent,
  };

  return <DataGridTemplate {...userConfig} />;
};

export default Modules;
