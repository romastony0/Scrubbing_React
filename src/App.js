import React, { useState, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const App = () => {
  const fileInputRef = useRef(null);
  const convert = useCallback(() => {
    const fileInput = fileInputRef.current;

    // Display alert message if no file has been selected
    if (fileInput.files.length === 0) {
      alert("Please Select File First");
      return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    const planToFile = {
      COMVIVA_BANGLA: "Comviva_DUMABH",
      "COMVIVA_SHORT STORY": "Comviva_DUMASS",
      DELETA_MEMES: "Revevapa_DUMAMW",
      DIPL_ASTROMART: "Dipl_AM",
      NEWSTOR_PHILIPINESS: "Newstor_DUMAFW",
      "NEWSTOR_WORLD OF SPORTS": "Newstor_DUMASN",
      SMARTLINK_BOLLYWOOD: "Smartlink_SLBOL",
      SYM_BANGLA: "Symbiotic_DUMABAN",
      SYM_BOLLYWOOD: "Symbiotic_DUMABOL",
      SYM_FTUTOR: "Symbiotic_DUMASTF",
      SYM_MOLLYWOOD: "Symbiotic_DUMAMOL",
      SYM_MTUTOR: "Symbiotic_DUMAMT",
      SYM_URDU: "Symbiotic_DUMAURU",
      TIMWE_FOODFLIX: "Timwe_TIMFOOD",
      TIMWE_FUNNYFLIX: "Timwe_TIMFUN",
      TIMWE_GIGAPLAY: "Timwe_TIMGIP",
      TIMWE_PAYDAY: "Timwe_TIMGP",
      VICTORYLINK_M_LEARN: "Victorylink_MLP",
      "YEAH MOBILE_ASIAN TIPS": "Yeahmobile_DUMAAH",
    };

    reader.onload = function (e) {
      console.log("File loaded successfully");
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      sessionStorage.setItem("selectedFile", file.name);
      const json_data = workbook.SheetNames.reduce((acc, sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        return acc.concat(XLSX.utils.sheet_to_json(sheet));
      }, []);
      const mobile_numbers_by_plan = json_data.reduce((acc, row) => {
        const mobile_number = row["Mobile No."];
        let plan = row["Plan"];
        if (plan === "VICTORYLINK_M-LEARN" || plan === "VICTORYLINK_M-LEARN_POSTPAID" || plan === "VICTORYLINK_M-LEAR" || plan === "VICTORYLINK_M-LEARN_POSTPAID") {
          plan = "VICTORYLINK_M_LEARN";
        }
        if (plan === "DIPL_ASTRO MART" || plan === "DIPL_ASTRO MART_POSTPAID" || plan === "DIPL_ASTROMART_POSTPAID" || plan === "DIIPL_ASTRO MART_POSTPAID") {
          plan = "DIPL_ASTROMART";
        }
        if (mobile_number && plan) {
          acc[plan] = acc[plan] || [];
          acc[plan].push(mobile_number);
        }
        if (!plan) {
          console.log(row);
        }
        return acc;
      }, {});
      console.log("Mobile numbers by plan:", mobile_numbers_by_plan);
      const zip = new JSZip();
      for (const plan in mobile_numbers_by_plan) {
        const mobile_numbers = mobile_numbers_by_plan[plan];
        const count = mobile_numbers.length;
        const month_date = new Date().toLocaleString("default", { month: "short", day: "numeric" }).replace(/ /g, "").replace("0", "", 1);
        const file_name = `${planToFile[plan] || plan}_${count}n_${month_date}.txt`;
        const file_content = mobile_numbers.filter((number) => /^\d+$/.test(number)).join("\n");
        // console.log(`Creating file ${file_name} with content:`, file_content);
        zip.file(file_name, file_content);
      }
      zip.generateAsync({ type: "blob" }).then((content) => {
        console.log("Zip file generated successfully");
        const table = document.createElement("table");
        table.classList.add("table", "table-hover");
        const header = table.createTHead();
        const headerRow = header.insertRow(0);
        const headerCell1 = headerRow.insertCell(0);
        const headerCell2 = headerRow.insertCell(1);
        headerCell1.innerText = "Plan";
        headerCell2.innerText = "Total Counts";
        const tableBody = document.createElement("tbody");
        const planList = Object.entries(mobile_numbers_by_plan)
          .sort(([planA], [planB]) => planA.localeCompare(planB))
          .map(([plan, mobile_numbers]) => ({ plan, count: mobile_numbers.length }));
        for (const { plan, count } of planList) {
          const row = tableBody.insertRow();
          const cell1 = row.insertCell(0);
          const cell2 = row.insertCell(1);
          cell1.innerText = plan;
          cell2.innerText = count;
        }
        table.appendChild(header);
        table.appendChild(tableBody);
        document.getElementById("table-container").appendChild(table);

        const today = new Date();
        const dateString = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
        saveAs(content, `${dateString}.zip`);
        console.log("Zip file downloaded successfully");
      });
    };
    reader.readAsArrayBuffer(file);
  }, []);

  return (
    <div>
      <div className="container mb-4">
        <div className="row">
          <div className="col-md-12 text-center mx-auto rounded">
            <h1 className="text-center bg-dark text-light text-uppercase p-2">DU Promotion</h1>
          </div>
        </div>

        <div className="col-md-12 col-lg-8 offset-lg-2 text-center mx-auto">
          <div className="card">
            <div className="card-body">
              <p className="mb-3 mt-5 form-label h6">Select an Excel file to convert:</p>

              <input type="file" id="fileInput" className="mb-5 form-control w-100 mx-auto" ref={fileInputRef} />

              <button onClick={convert} className="btn btn-danger">
                Convert
              </button>
            </div>
          </div>
        </div>
      </div>

      <div id="table-container"></div>
    </div>
  );
};

export default App;
