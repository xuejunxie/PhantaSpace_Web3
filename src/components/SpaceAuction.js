import React, { useEffect, useState } from "react";
import { useMoralisQuery } from "react-moralis";

export default function SpaceAuction() {
  const [limit, setLimit] = useState(10000);

  const { data, error, isLoading } = useMoralisQuery(
    "auction",
    (query) =>
      // query all
      query.limit(limit),
    [limit],
    {
      live: true,
    }
  );

  useEffect(() => {
    console.log("data", data);
  }, [data]);

  return <div>SpaceAuction</div>;
}
