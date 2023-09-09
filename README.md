# Sync Time

Consider two users in system. Each one have their own digital clocks. They can set/edit their clock time and clock tick(delay of tick) in their clocks and can view time of their clocks.
Eg: User1 has set 10:00:00 time and tick of 2 sec in his clock and User2 has set 12:00:00 tick of 1sec in his clock.

After 10 mins :
User1 clock time - 10:05:00 (as tick is set to 2 sec so at every two second their clock will tick once) 
User2 clock time - 12:10:00 (as tick is set to 1 sec so at every once second their clock will tick once)


They can sync each other's time, means if user2 syncs clock time of user1 then
User2's clock time will be 10:00:00 and User1's clock time will be 10:00:00 (they both will have same time in their clocks as they sync)

But after 10 mins :
User1 clock time - 10:05:00 (as tick is set to 2 sec so at every two second their clock will tick once) 
User2 clock time - 10:10:00 (as tick is set to 1 sec so at every once second their clock will tick once)


I have created three apis:

1) For setting users clock time /set-time
2) For viewing current clock time /get-time
3) For sync time of two users /sync-time

Please note that, 
# First set-time api must be used in order to get user details 
# I have used caching in nodejs, so every time any changes will be done in code, all data will be deleted, then one will have to add new data again


#  Run npm run start to start node server

If any queries, pls reach out to me on : hitarthkansara27@gmail.com

# Thank you
