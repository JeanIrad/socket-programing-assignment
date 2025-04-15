const express = require("express");
const net = require("net");
const bodyParser = require("body-parser");
const app = express();
const PORT = 3000;
const TCP_PORT = 8888;
const TCP_HOST = "localhost";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/public`)); // For serving your HTML
function renderResultHTML(response, type) {
  let content = "";
  if (type === "dept_list" && Array.isArray(response?.members)) {
    content = `
      <h4 class="mb-3 text-info">Department Members</h4>
      <div class="table-responsive">
        <table class="table table-striped table-bordered">
          <thead class="table-light">
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Department Number</th>
              <th>Department Name</th>
              <th>Email</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            ${response.members
              .map(
                (person) => `
              <tr>
                <td>${person.first_name}</td>
                <td>${person.last_name}</td>
                <td>${person.dept_number}</td>
                <td>${person.department}</td>
                <td>${person.email}</td>
                <td>${person.phone}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  } else if (typeof response === "object" && response !== null) {
    content = `
      <h4 class="mb-3 text-info">Information Found</h4>
      <div class="card shadow-sm p-3">
        <ul class="list-group list-group-flush">
          ${Object.entries(response)
            .map(
              ([key, value]) =>
                `<li class="list-group-item"><strong>${key}:</strong> ${value}</li>`
            )
            .join("")}
        </ul>
      </div>
    `;
  } else {
    content = `<div class="alert alert-warning">No data found for your request.</div>`;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>Query Result</title>
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
      >
    </head>
    <body class="bg-light">
      <div class="container py-5">
        <h2 class="mb-4 text-success">✅ Query Result</h2>
        ${content}
        <a href="/" class="btn btn-outline-primary mt-4">← Back to Form</a>
      </div>
    </body>
    </html>
  `;
}

function sendToTCPServer(requestObj) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    let responseData = "";

    client.connect(TCP_PORT, TCP_HOST, () => {
      client.write(JSON.stringify(requestObj));
    });

    client.on("data", (data) => {
      responseData += data.toString();
      client.end(); // Close connection after receiving data
    });

    client.on("end", () => {
      try {
        resolve(JSON.parse(responseData));
      } catch (err) {
        reject(err);
      }
    });

    client.on("error", (err) => {
      reject(err);
    });
  });
}
app.get("/", async (req, res) => {
  res.sendFile(`${__dirname}/public/index.html`);
});
// Handle form submission
app.post("/query", async (req, res) => {
  const { request_type, first_name, last_name, dept_number } = req.body;

  const requestObj = {
    request_type,
    first_name,
    last_name,
    dept_number,
  };

  try {
    const response = await sendToTCPServer(requestObj);

    res.send(renderResultHTML(response, req.body.request_type));
  } catch (error) {
    console.error("Error talking to TCP server:", error);
    res.status(500).send("Server error");
  }
});

app.listen(PORT, () => {
  console.log(`Express proxy server running at http://localhost:${PORT}`);
});
