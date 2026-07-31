const GetCurrUser = () => {
  return {
    token: sessionStorage.getItem("token"),
    roles: JSON.parse(sessionStorage.getItem("roles") || "[]"),
    userId: Number(sessionStorage.getItem("userId")),
  };
};

export default GetCurrUser;
