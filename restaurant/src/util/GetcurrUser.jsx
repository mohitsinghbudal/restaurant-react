const GetCurrUser = () => {
  const token = sessionStorage.getItem("token");
  
  const rawUserId = sessionStorage.getItem("userId");
  const userId = rawUserId ? Number(rawUserId) : null;
  
  let roles = [];
  try {
    const storedRoles = sessionStorage.getItem("roles");
    if (storedRoles) {
      const parsed = JSON.parse(storedRoles);
      // Ensure element numbers are cleanly cast as primitive Numbers
      roles = Array.isArray(parsed) ? parsed.map(Number) : [];
    }
  } catch (e) {
    console.error("Error parsing roles from sessionStorage", e);
  }

  const roleId = roles.length > 0 ? roles[0] : null;

  return {
    token,
    userId,
    roles,
    roleId,
    roleIds: roles,
  };
};

export default GetCurrUser;