const GetCurrUser = () => {
  return {
    token: sessionStorage.getItem("token"),
    roleId: Number(sessionStorage.getItem("roleId")),
    userId: Number(sessionStorage.getItem("userId")),
    sessionId:Number(sessionStorage.getItem("sessionId")),
  };
};

export default GetCurrUser;