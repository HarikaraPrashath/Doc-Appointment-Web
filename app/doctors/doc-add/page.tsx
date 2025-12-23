"use client"
import React from 'react'
import { ChevronDownIcon, Upload } from "lucide-react"
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from 'next/link'
import { set } from 'date-fns'
import { ca, se } from 'date-fns/locale'

type props = {
  onUploaded?: (url: string) => void //send URL back to parent component
}

type DoctorFormData = {
  personal: {
    firstName: string
    lastName: string
    dob: Date | null
    gender: "male" | "female" | "other" | ""
    address: string
    city: string
    province: string
    postalCode: string
    phone: string
    email: string
    emergencyContactName: string
    emergencyContactPhone: string
    photoUrl: string
  }
  professional: {
    primarySpecialization: string
    secondarySpecialization: string
    medicalLicenseNumber: string
    licenseExpiryDate: Date | null
    qualifications: string
    yearsOfExperience: string
    education: string
    certification: string
    department: string
    position: string
  }
}

const defaultDoctorFormData: DoctorFormData = {
  personal: {
    firstName: "",
    lastName: "",
    dob: null,
    gender: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    phone: "",
    email: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    photoUrl: "",
  },
  professional: {
    primarySpecialization: "",
    secondarySpecialization: "",
    medicalLicenseNumber: "",
    licenseExpiryDate: null,
    qualifications: "",
    yearsOfExperience: "",
    education: "",
    certification: "",
    department: "",
    position: "",
  },
}


const page = ({ onUploaded }: props) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const [formData, setFormData] = React.useState<DoctorFormData>(defaultDoctorFormData)
  const [uploadFile, setUploadFile] = React.useState<File | null>(null)
  const [uploading, setUploading] = React.useState(false)
  const [photoUrl, setPhotoUrl] = React.useState<string | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(undefined)
  const [saving, setSaving] = React.useState(false)

  function setField<S extends keyof DoctorFormData, K extends keyof DoctorFormData[S]>(section: S, key: K, value: DoctorFormData[S][K]) {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      },
    }))
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file")
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("File size exceeds 2MB")
      return
    }

    setUploadFile(file)
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  async function handleUpload() {
    if (!uploadFile) {
      alert("No file selected")
      return
    }

    try {
      setUploading(true)
      const fd = new FormData()
      fd.append("file", uploadFile)
      fd.append("folderName", "doctor/profile")

      console.log("file upload started", fd)
      const { data } = await axios.post("/api/upload", fd, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
      })

      if (data?.error) {
        alert(data.error)
      }

      const uploadedUrl = data?.url || data?.secure_url || null
      console.log("file upload completed", uploadedUrl)
      if (!uploadedUrl) {
        alert("Upload success but URL not return from API")
        return
      }

      //save in formatted data
      setField("personal", "photoUrl", uploadedUrl)
      onUploaded?.(uploadedUrl)

      //reset Picker
      setUploadFile(null)
      if (preview) URL.revokeObjectURL(preview)
      setPreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ""

      alert("File uploaded successfully")
    } catch (error) {
      alert("Error uploading file, Please try again")
    }
    finally {
      setUploading(false)
    }


    //Validation function can be added here
    function validateForm(): string | null {
      if (!formData.personal.firstName.trim()) return "First name is required"
      if (!formData.personal.lastName.trim()) return "Last name is required"
      if (!formData.personal.email.trim()) return "Email address is required"
      if (!formData.personal.phone.trim()) return "Phone number is required"
      if (!formData.professional.primarySpecialization) return "Primary specialization is required"
      if (!formData.professional.medicalLicenseNumber.trim()) return "Medical license number is required"
      return null
    }

    function buildPayload() {
      //convert Dates to ISO strings for backend
      return {
        personal: {
          ...formData.personal,
          firstName: formData.personal.firstName.trim(),
          lastName: formData.personal.lastName.trim(),
          email: formData.personal.email.trim(),
          phone: formData.personal.phone.trim(),
          address: formData.personal.address.trim(),
          city: formData.personal.city.trim(),
          province: formData.personal.province.trim(),
          postalCode: formData.personal.postalCode.trim(),
          emergencyContactName: formData.personal.emergencyContactName.trim(),
          emergencyContactPhone: formData.personal.emergencyContactPhone.trim(),
          dob: formData.personal.dob ? formData.personal.dob.toISOString() : null,
        },
        professional: {
          ...formData.professional,
          medicalLicenseNumber: formData.professional.medicalLicenseNumber.trim(),
          yearsOfExperience: formData.professional.yearsOfExperience.trim(),
          qualifications: formData.professional.qualifications.trim(),
          education: formData.professional.education.trim(),
          certification: formData.professional.certification.trim(),
          licenseExpiryDate: formData.professional.licenseExpiryDate
            ? formData.professional.licenseExpiryDate.toISOString()
            : null,
        },
      }
    }

    async function handleSave() {
      const err = validateForm()
      if (err) {
        alert(err)
        return
      }

      try {
        setSaving(true)
        const payload = buildPayload()
        console.log("Saving doctor data", payload)
        //send to backend
        const res = await axios.post("/api/doctors", payload)
        if (res.data?.error) {
          alert(res.data.error)
          return
        }

        alert("Doctor added successfully")
        setFormData(defaultDoctorFormData)
      }
      catch (error) {
        alert("Error saving doctor data. Please try again.")
      }
      finally {
        setSaving(false)
      }

    }
    return (
      <div className="mt-6 flex w-full flex-col  max-w-6xl mx-auto">
        {/* Header */}
        <div className='my-5 text-red-400'>
          <h1 className="text-4xl font-semibold">Add Doctor</h1>
          <p className="text-muted-foreground">
            Add new doctor to your platform
          </p>
        </div>

        <Tabs defaultValue="personal" className="">
          <TabsList className=" bg-transparent bg-gray-800">
            <TabsTrigger
              value="personal"
              className="
      data-[state=active]:bg-black
      data-[state=active]:text-white
      rounded-md
    "
            >
              Personal Information
            </TabsTrigger>

            <TabsTrigger
              value="professional"
              className="
      data-[state=active]:bg-black
      data-[state=active]:text-white
      rounded-md
    "
            >
              Professional Information
            </TabsTrigger>
          </TabsList>


          <TabsContent value="personal" className='my-5' >
            <Card className="border-gray-700">
              <CardHeader className='text-red-400'>
                <CardTitle className='text-xl'>Personal Information</CardTitle>
                <CardDescription>
                  Enter the doctor's personal details.
                </CardDescription>
              </CardHeader>

              {/* Personal Info  */}
              <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>First Name</Label>
                  <Input placeholder="First name" className='border-gray-700' />
                </div>

                <div className="grid gap-2">
                  <Label>Last Name</Label>
                  <Input placeholder="Last name" className='border-gray-700' />
                </div>

                <div className="grid gap-2">
                  <Label>Date of Birth</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between font-normal border-gray-700"
                      >
                        Select date
                        <ChevronDownIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid gap-2">
                  <Label>Gender</Label>
                  <Select>
                    <SelectTrigger className="w-full border-gray-700">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>

              {/* Address */}
              <CardContent className="grid gap-6">
                <div className="grid gap-2">
                  <Label>Address</Label>
                  <Textarea placeholder="Enter address" className='border-gray-700' />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="grid gap-2">
                    <Label>City</Label>
                    <Input className='border-gray-700' />
                  </div>
                  <div className="grid gap-2">
                    <Label>Province</Label>
                    <Input className='border-gray-700' />
                  </div>
                  <div className="grid gap-2">
                    <Label>Postal Code</Label>
                    <Input className='border-gray-700' />
                  </div>
                </div>
              </CardContent>
              <div className='h-[1px] w-[95%] mx-auto bg-gray-700 my-6'></div>
              {/*  Contact  */}
              <CardHeader className="pt-">
                <CardTitle className='text-xl text-red-400'>Contact Details</CardTitle>
              </CardHeader>

              <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Phone Number</Label>
                  <Input className='border-gray-700' />
                </div>

                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input type="email" className='border-gray-700' />
                </div>

                <div className="grid gap-2">
                  <Label>Emergency Contact Name</Label>
                  <Input className='border-gray-700' />
                </div>

                <div className="grid gap-2">
                  <Label>Emergency Contact Phone</Label>
                  <Input className='border-gray-700' />
                </div>
              </CardContent>
              <div className="flex items-center gap-6 mx-10 my-4">
                <Avatar className="h-24 w-24 bg-gray-700">
                  <AvatarImage src={photoUrl ?? preview ?? ""} />
                  <AvatarFallback>
                    <Upload className="h-6 w-6 opacity-60" />
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/gif"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-700"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {uploadFile ? "Change photo" : "Select photo"}
                    </Button>

                    <Button
                      type="button"
                      className="border border-gray-700"
                      onClick={handleUpload}
                      disabled={uploading || !uploadFile}
                    >
                      {uploading ? "Uploading..." : "Upload"}
                    </Button>
                  </div>

                  {uploadFile && (
                    <p className="text-xs text-muted-foreground max-w-[320px] truncate">
                      Selected: {uploadFile.name}
                    </p>
                  )}

                  <p className="text-sm text-muted-foreground">
                    JPG, PNG or GIF. Max 2MB.
                  </p>

                  {photoUrl && (
                    <Link className="text-sm underline" href={photoUrl} target="_blank">
                      View uploaded photo
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="professional" className='my-5' >
            <Card className="border-gray-700">
              <CardHeader >
                <CardTitle className='text-red-400 text-xl'>Professional Details</CardTitle>
                <CardDescription className='text-red-400'>
                  Enter the doctor's professional details.
                </CardDescription>
              </CardHeader>

              {/* Personal Info  */}
              <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Primary Specialization</Label>
                  <Select>
                    <SelectTrigger className="w-full border-gray-700">
                      <SelectValue placeholder="Select Specialization" className='text-gray-700' />
                    </SelectTrigger>
                    <SelectContent className="bg-black">
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="dermatology">Dermatology</SelectItem>
                      <SelectItem value="neurology">Neurology</SelectItem>
                      <SelectItem value="orthopedics">Neurology</SelectItem>
                      <SelectItem value="pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="psychiatry">Psychiatry</SelectItem>
                      <SelectItem value="general-medicine">General Medicine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Secondary Specialization (Optional)</Label>
                  <Select>
                    <SelectTrigger className="w-full border-gray-700">
                      <SelectValue placeholder="Select Specialization" className='text-gray-700' />
                    </SelectTrigger>
                    <SelectContent className="bg-black">
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="dermatology">Dermatology</SelectItem>
                      <SelectItem value="neurology">Neurology</SelectItem>
                      <SelectItem value="orthopedics">Neurology</SelectItem>
                      <SelectItem value="pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="psychiatry">Psychiatry</SelectItem>
                      <SelectItem value="general-medicine">General Medicine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Medical License Number</Label>
                  <Input className='border-gray-700' placeholder='Enter the license number' />

                </div>

                <div className="grid gap-2">
                  <Label>License Expiry Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between font-normal border-gray-700"
                      >
                        Select date
                        <ChevronDownIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" />
                    </PopoverContent>
                  </Popover>

                </div>
              </CardContent>

              {/* Qualifications */}
              <CardContent className="grid gap-6">
                <div className="grid gap-2">
                  <Label>Qualifications</Label>
                  <Textarea placeholder="Enter qualifications (MD,PhD,etc)" className='border-gray-700' />
                </div>
              </CardContent>
              <CardContent>
                <div className="grid gap-2">
                  <Label>Year of experience</Label>
                  <Input className='border-gray-700' />
                </div>
              </CardContent>
              <div className='h-[1px] w-[95%] mx-auto bg-gray-700 my-6'></div>
              {/*  Education  */}
              <CardHeader className="pt-0">
                <CardTitle className='text-xl text-red-400'>Education & Training</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-2">
                  <Label>Education</Label>
                  <Textarea placeholder="Enter education" className='border-gray-700' />
                </div>
              </CardContent>
              <CardContent className="grid gap-6">
                <div className="grid gap-2">
                  <Label>Certification</Label>
                  <Textarea placeholder="Enter certification" className='border-gray-700' />
                </div>
              </CardContent>
              <div className='h-[1px] w-[95%] mx-auto bg-gray-700 my-6'></div>
              <CardHeader className="pt-0">
                <CardTitle className='text-xl text-red-400'>Department & Position</CardTitle>
              </CardHeader>
              <CardContent className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className="grid gap-2 w-full">
                  <Label>Department</Label>
                  <Select>
                    <SelectTrigger className="w-full border-gray-700">
                      <SelectValue placeholder="Select Specialization" className='text-gray-700' />
                    </SelectTrigger>
                    <SelectContent className="bg-black">
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="dermatology">Dermatology</SelectItem>
                      <SelectItem value="neurology">Neurology</SelectItem>
                      <SelectItem value="orthopedics">Neurology</SelectItem>
                      <SelectItem value="pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="psychiatry">Psychiatry</SelectItem>
                      <SelectItem value="general-medicine">General Medicine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Position</Label>
                  <Select>
                    <SelectTrigger className="w-full border-gray-700">
                      <SelectValue placeholder="Select Specialization" className='text-gray-700' />
                    </SelectTrigger>
                    <SelectContent className="bg-black">
                      <SelectItem value="department-head">Department Head</SelectItem>
                      <SelectItem value="senior-doctor">Senior Doctor</SelectItem>
                      <SelectItem value="specialist">Specialist</SelectItem>
                      <SelectItem value="resident">Resident</SelectItem>
                      <SelectItem value="intern">Intern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <CardFooter className="flex justify-end ">
          <Button className='border border-red-400 text-red-400'>Save changes</Button>
        </CardFooter>
      </div>

    )
  }

  export default page
