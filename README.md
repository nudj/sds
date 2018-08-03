# sds
A simple web scraper for gleaning and enriching company information as part of our sales efforts.

# Setup
## Local
1. Run `make up` on `nudj/server`
2. `docker-compose -p nudj -f ./docker-compose-sds.yml up -d --force-recreate --no-deps sds` to run sds in local environment
3. `docker-compose -p nudj -f ./docker-compose-sds.yml exec sds /bin/sh` to get shell session inside sds

## Staging
1. Build the image: `docker build -t nudj/sds .`
2. Push any changes you want on staging to dockerhub: `docker push nudj/sds`
3. `scp` the `docker-compose-sds.yml` file on to the staging box if it doesn't already exist, or is out of date.
4. ssh into staging box
4. Run `docker pull nudj/sds` if you pushed in step 2
4. Run `cd staging`
5. `docker-compose -p staging -f ../sds/docker-compose-sds.yml up -d --force-recreate --no-deps sds` to run sds in local environment
6. `docker-compose -p staging -f ../sds/docker-compose-sds.yml exec sds /bin/sh` to get shell session inside sds

# Scripts
## Enrichment
The enrichment script sends companies from a sample group to [Clearbit](https://clearbit.com/) and [Hunter](https://hunter.io/) and stores the enriched results in their place. This is usually done in preparation for an email campaign.

### Options
- `-s, --sample` - Specify the targeted sample group (required)

### Examples
```shell
  # Enriches the companies in the 00001-jenesis sample group
  yarn run enrich-companies -s 00001-jenesis
```

## Postman
This script is used to send out a large number of emails to a specific sample group. By default, this is in a sandbox state and will not send real emails unless specifically instructed to do so with `--tap`.

### Options
- `-s, --sample` - Specify the targeted sample group (required)
- `--tap` - Use this option to send **real** emails instead of a dry run.

### Examples
```shell
  # Launch a dry-run with the 00001-jenesis sample where no real emails are sent
  yarn run postman -s 00001-jenesis

  # Send real emails to the nudj team
  yarn run postman -s 00000-nudj --tap
```

## Fetch Mailgun Logs
This script fetches the previous day's mailgun logs. This script should be run every day in order to save the logs for data purposes, as they are otherwise lost within two days.

### Examples
```shell
  # Fetches and stores a complete set of yesterday's mailgun logs
  yarn run fetch-mailgn-logs
```

## Blacklist
Use this script to update the set of blacklisted emails and companies that **will not** be contacted when the [postman](#postman) script is run.  This can be used to add both unsubscribers and leads.

### Options
- `-u, --unsubscribes` - Specifies the email to blacklist at to their request
- `-l, --leads` - Specifies the leads' emails to blacklist so we're not still marketing at them
- `-c, --companies` - Specifies the companies to add to the blacklist so that no one from the company will be contacted

### Examples
```shell
  # Adds "dave@email.tld" & "phil@email.tld" to the blacklist as unsubscribers
  yarn run blacklist --unsubscribes dave@email.tld phil@email.tld

  # Adds "gavin@email.tld", "daghost@email.tld" & "jeff@email.tld" to the blacklist as active leads
  yarn run blacklist --leads gavin@email.tld daghost@email.tld jeff@email.tld

  # Adds 'Phasma Corp' & 'Cybus Industries' as blacklisted companies.
  yarn run blacklist --companies 'Phasma Corp' 'Cybus Industries'

  # Runs a combination of the above in one go
  yarn run blacklist \
    --unsubscribes dave@email.tld phil@email.tld \
    --leads gavin@email.tld daghost@email.tld jeff@email.tld \
    --companies 'Phasma Corp' 'Cybus Industries'
```
