export const authenticate = () => (req: any, res: any, next: any) => {
  if (!req.user) {
    return res.status(401).send("Authorization required!!!");
  } else {
    next();
  }
};
