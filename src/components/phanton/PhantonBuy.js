import React from "react";
import MailchimpSubscribe from "react-mailchimp-subscribe";

const postUrl = `https://genhybridsystems.us1.list-manage.com/subscribe/post?u=${process.env.REACT_APP_MAILCHIMP_U}&id=${process.env.REACT_APP_MAILCHIMP_ID}`;

export default function PhantonBuy() {
  return (
    <div className="text-light mt-5">
      {/* <MailchimpSubscribe /> */}
      <h5>Come back later for private token sale</h5>
    </div>
  );
}
