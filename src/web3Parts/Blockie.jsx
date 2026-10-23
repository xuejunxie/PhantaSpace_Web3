import { Skeleton } from "antd";
import Blockies from "react-blockies";
import { useAuth } from "../supabase";

/**
 * Shows a blockie image for the provided wallet address
 * @param {*} props
 * @returns <Blockies> JSX Elemenet
 */

function Blockie(props) {
  const { account, isAuthenticated } = useAuth();
  if (!props.address && (!account || !isAuthenticated)) return <Skeleton.Avatar active size={40} />;

  return (
    <Blockies seed={props.currentWallet ? account.toLowerCase() : props.address.toLowerCase()} className="identicon" {...props} />
  );
}

export default Blockie;
