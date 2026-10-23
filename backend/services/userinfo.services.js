// user info service here: business logic only, no req/res
import { clerkClient } from "@clerk/express";

const userInfoService = async (userId) => {
  const user = await clerkClient.users.getUser(userId);
  return {
    userId: user.id,
    email: user.primaryEmailAddress?.emailAddress,
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
  };
};

export default userInfoService;
