"use strict";

const net = require("net");
const { PrismaClient } = require("../src/generated/prisma");
require("dotenv").config({ path: "../.env" });

const prisma = new PrismaClient();

const server = net.createServer((socket) => {
  console.log(`Client connected: ${socket.remoteAddress}:${socket.remotePort}`);

  socket.on("data", async (data) => {
    try {
      const request = JSON.parse(data.toString());
      console.log("REQUEST:", request);
      const { request_type, first_name, last_name, dept_number } = request;

      let response = { status: "error", message: "Invalid request" };

      const getDepartment = async (deptNumber) => {
        const departments = await prisma.department.findMany();
        console.log("DEPART", departments);
        return departments[deptNumber - 1] || null;
      };

      // 📧 Handle email request
      if (request_type === "email") {
        let result = null;

        if (first_name && last_name) {
          result =
            (await prisma.student.findFirst({
              where: { firstName: first_name, lastName: last_name },
            })) ||
            // (await prisma.lecturer.findFirst({
            //   where: { firstName: first_name, lastName: last_name },
            // }));
            console.log("RESULT:", result);
        } else if (last_name && dept_number) {
          const dept = await getDepartment(dept_number);
          if (dept) {
            result = await prisma.student.findFirst({
              where: {
                lastName: last_name,
                departmentId: dept.id,
              },
            });
            //  ||
            // (await prisma.lecturer.findFirst({
            //   where: {
            //     lastName: last_name,
            //     departmentId: dept.id,
            //   },
            // }));
          }
        }

        if (result) {
          response = { status: "success", email: result.email };
        } else {
          response.message = "Person not found";
        }
      }

      // 📱 Handle phone request
      else if (request_type === "phone") {
        let result = null;

        if (first_name && last_name) {
          result = await prisma.student.findFirst({
            where: { firstName: first_name, lastName: last_name },
          });
          // ||
          // (await prisma.lecturer.findFirst({
          //   where: { firstName: first_name, lastName: last_name },
          // }));
        } else if (last_name && dept_number) {
          const dept = await getDepartment(dept_number);
          if (dept) {
            result = await prisma.student.findFirst({
              where: {
                lastName: last_name,
                departmentId: dept.id,
              },
            });
            // ||
            // (await prisma.lecturer.findFirst({
            //   where: {
            //     lastName: last_name,
            //     departmentId: dept.id,
            //   },
            // }));
          }
        }

        if (result) {
          response = { status: "success", phone: result.phone };
        } else {
          response.message = "Person not found";
        }
      }

      // 🏢 Handle department member list
      else if (request_type === "dept_list") {
        if (dept_number) {
          const dept = await getDepartment(dept_number);
          if (dept) {
            const students = await prisma.student.findMany({
              where: { departmentId: dept.id },
              include: { department: true },
            });
            // const lecturers = await prisma.lecturer.findMany({
            //   where: { departmentId: dept.id },
            // });
            console.log("STUDENTS", students);

            const members = [
              ...students.map((s) => ({
                role: "student",
                first_name: s.firstName,
                last_name: s.lastName,
                email: s.email,
                phone: s.phone,
                department: s.department.name,
                dept_number: s.department.id,
              })),
              // ...lecturers.map((l) => ({
              //   role: "lecturer",
              //   first_name: l.firstName,
              //   last_name: l.lastName,
              //   email: l.email,
              //   phone: l.phone,
              // })),
            ];

            response =
              members.length > 0
                ? { status: "success", members }
                : {
                    status: "error",
                    message: `No members found in department ${dept_number}`,
                  };
          } else {
            response.message = "Invalid department number";
          }
        } else {
          response.message = "Department number required";
        }
      }
      console.log("RESPONSEEE", response);

      socket.write(JSON.stringify(response));
    } catch (err) {
      console.error("Error:", err.message);
      socket.write(
        JSON.stringify({ status: "error", message: "Invalid request format" })
      );
    }
  });

  socket.on("end", () => {
    console.log(
      `Client disconnected: ${socket.remoteAddress}:${socket.remotePort}`
    );
  });

  socket.on("error", (err) => {
    console.error(`Socket error: ${err.message}`);
  });
});

// Start server
const PORT = process.env.PORT || 8888;
server.listen(PORT, () => {
  console.log(`🧠 TCP Server running on port ${PORT}`);
});
