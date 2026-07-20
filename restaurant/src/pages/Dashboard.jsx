import React from "react";
import Tables from "./Tables";
import GetCurrUser from "../util/GetcurrUser";
import { showToast } from "../components/showToast";

function Dashboard() {
  const { token } = GetCurrUser();

  return token ? (
    <>
      <div>Dashboard</div>
      <Tables />
    </>
  ) : (
    <h1>Unauthorized</h1>
  );
}

export default Dashboard;