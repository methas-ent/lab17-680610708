"use client"

import { useMemo, useState } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, RotateCcw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  createCourseFormSchema,
  emptyCourseForm,
  type CourseFormValues,
} from "@/lib/schemas/course-schema";
import { useEnrollmentStore } from "@/lib/enrollment-store";

import { Switch } from "@/components/ui/switch";

export function AddNewCourseDialog() {
  const programOptions = [
    { value: "CPE", label: "CPE — วิศวกรรมคอมพิวเตอร์" },
    { value: "ISNE", label: "ISNE — วิศวกรรมระบบสารสนเทศและเครือข่าย" },
  ];

  const semesterOptions = [
    { value: "1", label: "ภาคการศึกษาที่ 1" },
    { value: "2", label: "ภาคการศึกษาที่ 2" },
    { value: "3", label: "ภาคฤดูร้อน" },
  ];

  const addCourse = useEnrollmentStore((s) => s.addCourse);
  const courses = useEnrollmentStore((s) => s.courses);
  const [open, setOpen] = useState(false);

  const schema = useMemo(() => createCourseFormSchema(courses), [courses]);
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: emptyCourseForm,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "instructors",
  });
  const description = useWatch({
    control: form.control,
    name: "description",
  }) ?? "";
  const instructorsError =
    form.formState.errors.instructors?.root ??
    form.formState.errors.instructors;

  function onSubmit(values: CourseFormValues) {
    addCourse({
      courseId: values.courseId.trim(),
      courseTitle: values.courseTitle.trim(),
      instructors: values.instructors,
      program: values.program,
      semester: values.semester,
      description: values.description,
      notifyByEmail: values.notifyByEmail,
    });

    resetForm();
    setOpen(false);
  }

  const resetForm = () => form.reset(emptyCourseForm);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      <DialogTrigger render={<Button />}>
        <PlusCircle className="h-4 w-4" />
        เพิ่มวิชา
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className="grid gap-4"
        >
          <DialogHeader>
            <DialogTitle>เพิ่มวิชาใหม่</DialogTitle>
            <DialogDescription>
              ลองใส่รหัสวิชาไม่ครบ 6 หลัก ใส่รหัสที่มีอยู่แล้ว
              หรือปล่อยชื่อวิชาไว้ว่าง แล้วกดบันทึก
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="courseId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="courseId">รหัสวิชา</FieldLabel>
                  <Input
                    {...field}
                    id="courseId"
                    placeholder="เช่น 261305"
                    inputMode="numeric"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="courseTitle"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="courseTitle">ชื่อวิชา</FieldLabel>
                  <Input
                    {...field}
                    id="courseTitle"
                    placeholder="เช่น Mobile Application Development"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <Controller
            name="program"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="program">หลักสูตร</FieldLabel>
                <Select
                  name={field.name}
                  items={programOptions}
                  value={field.value ?? null}
                  onValueChange={(v) => {
                    field.onChange(v);
                    field.onBlur();
                  }}
                >
                  <SelectTrigger
                    id="program"
                    className="w-full"
                    aria-invalid={fieldState.invalid}
                    ref={field.ref}
                  >
                    <SelectValue placeholder="เลือกหลักสูตร" />
                  </SelectTrigger>
                  <SelectContent>
                    {programOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />


          <Controller
            name="semester"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="semester">ภาคการศึกษา</FieldLabel>

                <RadioGroup
                  value={field.value ?? ""}
                  onValueChange={(value) => {
                    field.onChange(value);
                    field.onBlur();
                  }}
                  className="flex gap-4"
                  aria-invalid={fieldState.invalid}
                >
                  {semesterOptions.map((option) => (
                    <div key={option.value} className="flex items-center gap-2">
                      <RadioGroupItem
                        value={option.value}
                        id={`semester-${option.value}`}
                      />
                      <Label htmlFor={`semester-${option.value}`}>
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => {
              const overLimit = description.length > 100;

              return (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="description">รายละเอียด (ไม่บังคับ)</FieldLabel>
                  <Textarea
                    {...field}
                    id="description"
                    value={description}
                    aria-invalid={fieldState.invalid}
                    placeholder="คำอธิบายรายวิชา"
                  />
                  <div
                    className={
                      overLimit
                        ? "text-destructive text-xs"
                        : "text-muted-foreground text-xs"
                    }
                  >
                    {description.length}/100 ตัวอักษร
                  </div>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              );
            }}
          />

          <div className="grid gap-2">
            <div>
              <FieldLabel>ผู้สอน</FieldLabel>
              <p className="text-sm text-muted-foreground">
                {fields.length}/3 คน — กรอกชื่อผู้สอนและอีเมล name@cmu.ac.th
                (ห้ามซ้ำกัน)
              </p>
            </div>

            <div className="grid gap-3">
              {fields.map((item, index) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[24px_minmax(0,1fr)_minmax(0,1fr)_32px] items-start gap-2"
                >
                  <span className="pt-2 text-sm text-muted-foreground">
                    {index + 1}.
                  </span>

                  <Controller
                    name={`instructors.${index}.name`}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <Input
                          {...field}
                          placeholder="กรอกชื่อผู้สอน"
                          aria-label={`ชื่อผู้สอนคนที่ ${index + 1}`}
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name={`instructors.${index}.email`}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <Input
                          {...field}
                          type="email"
                          placeholder="name@cmu.ac.th"
                          aria-label={`อีเมลผู้สอนคนที่ ${index + 1}`}
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`ลบผู้สอนคนที่ ${index + 1}`}
                    onClick={() => remove(index)}
                    disabled={fields.length <= 1}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
            </div>

            {instructorsError?.message && (
              <FieldError errors={[instructorsError]} />
            )}

            <Button
              type="button"
              variant="outline"
              className="w-fit"
              onClick={() => append({ name: "", email: "" })}
              disabled={fields.length >= 3}
            >
              + เพิ่มผู้สอน
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="notifyByEmail">รับข่าวสารทางอีเมล</Label>
              <p className="text-sm text-muted-foreground">
                แจ้งเตือนผู้สอนเมื่อเปิดลงทะเบียน
              </p>
            </div>
            <Controller
              name="notifyByEmail"
              control={form.control}
              render={({ field }) => (
                <Switch
                  id="notifyByEmail"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>


          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetForm}>
              <RotateCcw className="mr-2 h-4 w-4" />
              ล้างฟอร์ม
            </Button>
            <Button type="submit">บันทึก</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
