export const setCacheControl = (req, res, next) => {
  const maxAge = 60 * 60 * 24 * 365;

  if (
    [".png", ".jpg", ".jpeg", ".gif", ".webp"].some((ext) =>
      req.path.endsWith(ext),
    )
  ) {
    res.set("Cache-Control", `public, max-age=${maxAge}, immutable`);
  } else {
    res.set("Cache-Control", "no-store");
  }

  next();
};
