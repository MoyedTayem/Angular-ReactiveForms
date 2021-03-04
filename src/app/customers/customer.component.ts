import { Component, OnInit } from '@angular/core';
import {FormGroup,FormBuilder, Validators ,AbstractControl, ValidatorFn,FormArray} from '@angular/forms'; 

import { Customer } from './customer';
import {debounceTime} from "rxjs/operators";

function confirmationEmail(c:AbstractControl):{[key:string]:boolean}|null
{
  const emailControl=c.get('email');
  const confirmEmailControl=c.get('confirmEmail');
  if (emailControl.pristine || confirmEmailControl.pristine)return null;
  if(emailControl.value===confirmEmailControl.value)return null;
  return {'match':true};

}  

 
function ratingRange(min :number ,max:number):ValidatorFn{  
return (c:AbstractControl):{
  [key:string]:boolean}|null => {
    if(c.value!==null&&(isNaN(c.value)||c.value<min||c.value>max))
    return {'range':true}
   return null;

  }
}

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
  customer = new Customer();
  customerForm:FormGroup; 
  constructor(private formBulider:FormBuilder) { }
  emailMessage : string;



  validationMessages ={
  required:"please enter your email",
  email:"please enter a valid email"
    };
      get addresses():FormArray{
        return <FormArray>this.customerForm.get('addresses');
      }
  ngOnInit(): void {
    this.customerForm=this.formBulider.group({
      firstName:['',[Validators.required,Validators.minLength(3)]],
      lastName:['',[Validators.required,Validators.maxLength(50)]],
      emailGroup:this.formBulider.group({
        email:['',[Validators.required,Validators.email]],
        confirmEmail:['',Validators.required],
      },{validators:confirmationEmail}),
      phone:"",
      rating:[null,ratingRange(1,5)],
      notification:'email',
      sendCatalog:true,
      addresses:this.formBulider.array([this.newAdress()]),
     

    })
    this.customerForm.get('notification').valueChanges.subscribe(value =>this.setNotification(value));
    
    const emailControl=this.customerForm.get("emailGroup");
    emailControl.valueChanges.pipe(debounceTime(1000)).subscribe(value =>this.setMessages(value));
  }
  setNotification(notifyVia:string):void{
    const phoneControl=this.customerForm.get('phone');
    if (notifyVia==='text'){
      phoneControl.setValidators(Validators.required);
    }
else{
  phoneControl.clearValidators();
}
phoneControl.updateValueAndValidity();
  }
  addAddress():void{
   this.addresses.push(this.newAdress());
 }
  newAdress ():FormGroup {
    return this.formBulider.group({
      addressType:'home',
      street1:" ",
      street2:" ",
      city:" ",state:" ",zip:" ",

    })
  }

  populateTestData():void{
    this.customerForm.patchValue({
      firstName:"Moyed",
      lastName:"Tayem",
      email:"bluewater4.mt@gmail.com",
    
      sendCatalog:true,
    })
  }
  save(): void {
    console.log(this.customerForm);
    console.log('Saved: ' + JSON.stringify(this.customerForm.value));
  }
  setMessages(c:AbstractControl):void{
    this.emailMessage='';
    if ((c.dirty||c.touched)&&c.errors){
        this.emailMessage=Object.keys(c.errors).map(key=>this.validationMessages[key]).join(' ');
    }

  }
}
