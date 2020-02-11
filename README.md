# Nebula
Applicant management and selection system for TAMU Datathon

### Project Structure

Both frontend & backend code is in this repo under the 'frontend' and 'server' folders respectively.

**Frontend:** Divided up into two: **Voyager** and **Nebula**. Both run on the same backend.
**Voyager:** Application review system, assigns two random reviewers to each candidate and asks them to score them accross 3 categories
**Nebula:** Applicant management / check-in system, let's us track what events / meals / workshops during the event

**Backend:** Express application container in `server`

### Setup
* Find the `dummy-config.js` file in the src folder of whatever application you want to run and copy it into a `config.js` file
* Fill out the appropriate values for the config variables needed in `config.js`

### Running 

* Make sure to have `docker` and `docker-compose` installed
* Choose which images (defined in `docker-compose.yml`) you want to run and comment / remove the rest
* Run `docker-compose up` from the root directory to start
