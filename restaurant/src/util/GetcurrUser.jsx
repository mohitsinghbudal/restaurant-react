const GetCurrUser = () => {
  const token = sessionStorage.getItem("token");

  const rawUserId = sessionStorage.getItem("userId");
  const userId = rawUserId ? Number(rawUserId) : null;

  let roles = [];

  try {
    const storedRoles = sessionStorage.getItem("roles");

    if (storedRoles) {
      const parsedRoles = JSON.parse(storedRoles);

      if (Array.isArray(parsedRoles)) {
        roles = parsedRoles
          .map(Number)
          .filter((role) => !isNaN(role));
      }
    }
  } catch (error) {
    console.error(
      "Error parsing roles from sessionStorage:",
      error
    );
  }

  // First role for components that still need a single role
  const roleId = roles.length > 0 ? roles[0] : null;

  return {
    token,
    userId,
    roles,
    roleId,
    roleIds: roles
  };
};

export default GetCurrUser;
