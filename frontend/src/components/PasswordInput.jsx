
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
export default function PasswordInput({value,onChange,placeholder='รหัสผ่าน',name='password'}){
 const [show,setShow]=useState(false);
 return <div className="relative"><input name={name} value={value||''} onChange={onChange} type={show?'text':'password'} placeholder={placeholder} className="input pr-12"/><button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-brown" onClick={()=>setShow(!show)}>{show?<EyeOff/>:<Eye/>}</button></div>
}
