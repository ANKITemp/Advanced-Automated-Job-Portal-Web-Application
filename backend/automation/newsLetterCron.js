import cron from "node-cron";
import { Job } from "../models/jobSchema.js";
import { User } from "../models/userSchema.js";
import { sendEmail } from "../utils/sendEmail.js";

export const newsLetterCron = () => {
  cron.schedule("*/5 * * * *", async () => {
    try {
      console.log("Running Cron Automation");
      const jobs = await Job.find({ newsLettersSent: false });

      for (const job of jobs) {
        try {
          const filteredUsers = await User.find({
            $or: [
              { "niches.firstNiche": job.jobNiche },
              { "niches.secondNiche": job.jobNiche },
              { "niches.thirdNiche": job.jobNiche },
            ],
          });

          let emailSentCount = 0;
          for (const user of filteredUsers) {
            try {
              const emailSent = await sendEmail({
                email: user.email,
                subject: `Hot Job Alert: ${job.title}`,
                message: `Hi ${user.name},\n\nA new job matching your profile has been posted.\n\nDetails:\n${job.title}\n${job.companyName}\n${job.location}\n\nBest regards,\nNicheNest Team`,
              });

              if (emailSent) emailSentCount++;

              // Add delay between emails
              await new Promise((resolve) => setTimeout(resolve, 1000));
            } catch (error) {
              console.error(`Failed to send email to ${user.email}:`, error);
              continue;
            }
          }

          // Mark as sent if at least some emails were successful
          if (emailSentCount > 0) {
            job.newsLettersSent = true;
            await job.save();
          }
        } catch (error) {
          console.error(`Error processing job ${job._id}:`, error);
          continue;
        }
      }
    } catch (error) {
      console.error("Cron job error:", error);
    }
  });
};
