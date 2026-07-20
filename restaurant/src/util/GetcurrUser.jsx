const GetCurrUser = () => {
  return {
    token: sessionStorage.getItem("token"),
    roleId: Number(sessionStorage.getItem("roleId")),
    userId: Number(sessionStorage.getItem("userId")),
  };
};

export default GetCurrUser;