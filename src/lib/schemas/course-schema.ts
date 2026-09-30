import { z } from "zod";
import type { Course } from "@/lib/types";

export const COURSE_TITLE_MAX = 100;

const instructorSchema = z.object({
  name: z.string().trim().min(1, "กรอกชื่อผู้สอน"),
  email: z
    .string()
    .trim()
    .email("ต้องเป็นอีเมล @cmu.ac.th")
    .refine((email) => email.toLowerCase().endsWith("@cmu.ac.th"), {
      message: "ต้องเป็นอีเมล @cmu.ac.th",
    }),
});

export function createCourseFormSchema(courses: Course[]) {
  return z.object({
    courseId: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "รหัสวิชาต้องเป็นตัวเลข 6 หลัก")
      .refine((id) => !courses.some((course) => course.courseId === id), {
        message: "รหัสวิชานี้มีอยู่แล้ว",
      }),

    courseTitle: z
      .string()
      .trim()
      .min(1, "กรอกชื่อวิชา")
      .max(
        COURSE_TITLE_MAX,
        `ชื่อวิชายาวได้ไม่เกิน ${COURSE_TITLE_MAX} ตัวอักษร`,
      ),

    program: z.enum(["CPE", "ISNE"], {
      message: "เลือกหลักสูตร",
    }),

    semester: z.enum(["1", "2", "3"], {
      message: "เลือกภาคการศึกษา",
    }),

    instructors: z
      .array(instructorSchema)
      .min(1, "ต้องมีผู้สอนอย่างน้อย 1 คน")
      .max(3, "เพิ่มผู้สอนได้ไม่เกิน 3 คน")
      .refine(
        (instructors) => {
          const emails = instructors.map((item) =>
            item.email.trim().toLowerCase(),
          );
          return new Set(emails).size === emails.length;
        },
        { message: "อีเมลผู้สอนซ้ำกัน" },
      ),

    description: z.string().max(100, "รายละเอียดยาวเกิน 100 ตัวอักษร"),

    notifyByEmail: z.boolean(),
  });
}

export type CourseFormValues = z.infer<
  ReturnType<typeof createCourseFormSchema>
>;

export const emptyCourseForm: CourseFormValues = {
  courseId: "",
  courseTitle: "",
  program: undefined as unknown as CourseFormValues["program"],
  semester: undefined as unknown as CourseFormValues["semester"],
  instructors: [{ name: "", email: "" }],
  description: "",
  notifyByEmail: false,
};
