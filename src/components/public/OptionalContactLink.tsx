import type {AnchorHTMLAttributes} from 'react';
/** Keep presentation but never activate absent contact information. */
export function OptionalContactLink({href,phone=false,children,...props}:Omit<AnchorHTMLAttributes<HTMLAnchorElement>,'href'>&{href?:string|null;phone?:boolean}){
 const valid=phone?/^tel:\+?\d[\d+-]*$/.test(href??''):Boolean(href?.trim())&&!/^(?:javascript:|data:|tel:$)/i.test(href??'');
 return valid?<a {...props} href={href!}>{children}</a>:<span className={props.className} aria-disabled="true">{children}</span>;
}
