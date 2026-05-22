require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const authRoutes = require("./routes/auth.routes");
const { errorHandler } = require("./routes/error.middleware");
const authAddress = require("./routes/address");
const vehical= require('./routes/vehical')
const vehicaltype =   require("./routes/vehicaltype");
const services = require("./routes/servicevehical");
const freq = require("./routes/freq")
const commonissues = require("./routes/commonIssus")
const servicetypes = require("./routes/servicerouets");
const ServiceCentre = require("./routes/Servicecentreroutes");
const sloutRouter = require('./routes/Scheduleroutes')
const bookingservicescope = require('./routes/bookingroutes')
const bookingSave= require("./routes/bookingSave")
const supportIssue = require("./routes/supportIssue")
const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", sloutRouter)
app.use("/api/auth", authRoutes);
app.use("/api", commonissues);
app.use("/api",bookingservicescope)
app.use("/api/service-types",servicetypes)
app.use("/api/service-centres",ServiceCentre)
app.use("/api/vehicle",vehicaltype)
app.use("/api", authAddress)
app.use("/api",vehical)
app.use("/api/fags",freq)
app.use("/api/user",require("./routes/profiledata"))
app.use("/api",bookingSave)
app.use("/api", supportIssue)
app.use("/api",services);


app.get("/health", (req, res) => {
  res.json({ status: true, message: "Server is running" });
});

app.use((req, res) => {
  res.status(404).json({ status: false, message: "Route not found" });
});

app.use(errorHandler);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
