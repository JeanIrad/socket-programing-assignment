const net = require("net");
const readline = require("readline");

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Connect to server
function connectToServer() {
  const client = new net.Socket();
  const HOST = "localhost";
  const PORT = 8888;

  client.connect(PORT, HOST, () => {
    console.log(`Connected to server: ${HOST}:${PORT}`);
    displayMenu(client);
  });

  // Handle server responses
  client.on("data", (data) => {
    try {
      const response = JSON.parse(data.toString());
      console.log("SERVER RESPONSE:", response);

      displayResults(response);
      displayMenu(client);
    } catch (error) {
      console.error("Error parsing server response:", error.message);
      displayMenu(client);
    }
  });

  // Handle connection closure
  client.on("close", () => {
    console.log("Connection closed");
    rl.close();
  });

  // Handle errors
  client.on("error", (err) => {
    console.error("Connection error:", err.message);
    rl.close();
  });

  return client;
}

// Display main menu
function displayMenu(client) {
  console.log("\n=== CST Database Client ===");
  console.log("1. Request email address");
  console.log("2. Request phone number");
  console.log("3. Request department list");
  console.log("4. Exit");

  rl.question("Select an option (1-4): ", (choice) => {
    switch (choice) {
      case "1":
        requestEmail(client);
        break;
      case "2":
        requestPhone(client);
        break;
      case "3":
        requestDepartmentList(client);
        break;
      case "4":
        console.log("Exiting client. Goodbye!");
        client.end();
        rl.close();
        break;
      default:
        console.log("Invalid option. Please try again.");
        displayMenu(client);
    }
  });
}

// Request email address
function requestEmail(client) {
  console.log("\n=== Request Email Address ===");
  console.log("1. Search by first and last name");
  console.log("2. Search by last name and department");

  rl.question("Select search method (1-2): ", (option) => {
    const request = { request_type: "email" };

    if (option === "1") {
      rl.question("Enter first name: ", (firstName) => {
        request.first_name = firstName;

        rl.question("Enter last name: ", (lastName) => {
          request.last_name = lastName;
          sendRequest(client, request);
        });
      });
    } else if (option === "2") {
      rl.question("Enter last name: ", (lastName) => {
        request.last_name = lastName;

        rl.question("Enter department number: ", (deptNumber) => {
          request.dept_number = parseInt(deptNumber);
          sendRequest(client, request);
        });
      });
    } else {
      console.log("Invalid option.");
      displayMenu(client);
    }
  });
}

// Request phone number
function requestPhone(client) {
  console.log("\n=== Request Phone Number ===");
  console.log("1. Search by first and last name");
  console.log("2. Search by last name and department");

  rl.question("Select search method (1-2): ", (option) => {
    const request = { request_type: "phone" };

    if (option === "1") {
      rl.question("Enter first name: ", (firstName) => {
        request.first_name = firstName;

        rl.question("Enter last name: ", (lastName) => {
          request.last_name = lastName;
          sendRequest(client, request);
        });
      });
    } else if (option === "2") {
      rl.question("Enter last name: ", (lastName) => {
        request.last_name = lastName;

        rl.question("Enter department number: ", (deptNumber) => {
          request.dept_number = parseInt(deptNumber);
          sendRequest(client, request);
        });
      });
    } else {
      console.log("Invalid option.");
      displayMenu(client);
    }
  });
}

// Request department list
function requestDepartmentList(client) {
  console.log("\n=== Request Department List ===");

  rl.question("Enter department number: ", (deptNumber) => {
    const request = {
      request_type: "dept_list",
      dept_number: parseInt(deptNumber),
    };

    sendRequest(client, request);
  });
}

// Send request to server
function sendRequest(client, request) {
  client.write(JSON.stringify(request));
}

// Display results from server
function displayResults(response) {
  console.log("\n=== Results ===");

  if (response.status === "error") {
    console.log(`Error: ${response.message}`);
  } else if (response.email) {
    console.log(`Email: ${response.email}`);
  } else if (response.phone) {
    console.log(`Phone: ${response.phone}`);
  } else if (response.members) {
    console.log(`Department Members:`);
    response.members.forEach((member, index) => {
      console.log(`\n${index + 1}. ${member.first_name} ${member.last_name}`);
      console.log(`   Email: ${member.email}`);
      console.log(`   Phone: ${member.phone}`);
    });
  }
}

// Start the client
const client = connectToServer();
