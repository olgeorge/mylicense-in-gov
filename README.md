# Mylicense

Backend for API access to some of the mylicense.in.gov features

## Background

The backend is set up to work with AWS Lambda

### AWS Lambda

The code is set up to run on AWS Lambda. It means that the backend doesn't have any instances/containers or loadbalances. AWS Lambda is automatically scaled according to the load.
All AWS functions can be found here
https://eu-west-1.console.aws.amazon.com/lambda/home?region=eu-west-1#/functions

## Set up (on Linux/OSX)
1. Install AWS CLI (skip for local-only development) 
http://docs.aws.amazon.com/cli/latest/userguide/installing.html
```
pip install awscli --upgrade --user
aws --version
```

2. Configure AWS CLI (skip for local-only development)
http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html

```
aws configure
AWS Access Key ID [None]: <access key>
AWS Secret Access Key [None]: <secret key>
Default region name [None]: eu-west-1
Default output format [None]: json
```

3. Install the dependencies `npm i`

4. Install serverless globally `npm i serverless -g`

## Development

### Coding practices

The backend uses layered architecture.
https://en.wikipedia.org/wiki/Multitier_architecture

- All the incoming requests are processed in the lambda folder. Lambda folder only calls methods from service (business) layer (apart from utils etc).
- Business layer resides in the services folder. It is responsible for high-level logic in the code. Methods from business layer only call other methods from business layer and methods from gateways/daos
- Gateways and DAOs are the abstractions through which the calls to remote services (and any other remote calls) are made. This is the only place for remote invocations. Gateways and DAOs can use service clients for convenience.
- Service clients live in the clients folder. These are simple wrappers around third-party clients or ajax libraries. Their main purpose is configuration. They often use environment variables to properly set the remote endpoints.

### Using Serverless

Serverless is a framework that allows you to run Lambda functions locally, deploy them, as well as do many other set-ups for AWS automatically.

### Using Secrets

The `serverless-secrets-plugin` is a serverless plugin which allows you to encrypt important information stored in `secrets.<stage>.yml` file. 
- In order to encrypt the file, run `serverless encrypt -s <stage> -p <secrets-password>`
- In order to decrypt the file, run `serverless decrypt -s <stage> -p <secrets-password>`
- Ask one of the team members for it over a **secure communication channel**
- **Never check in the `secrets.<stage>.yml`**. Only check in the encrypted version `secrets.<stage>.yml.encrypted`
- **Never store any sensitive information anywhere** except for the `secrets.<stage>.yml`, including this readme.  
- The `secrets-password` for this repo is `secrets`

## Running

In order to run the server locally, simply execute `./run-locally`. This will run the prod stage on port 8082. If you want to change that, you can run manually `serverless offline --port <port> --stage <stage>`.

## Testing

The simplest test to check if Lambda is running on AWS, run `./test.sh [<stage>]`. For a more thorough API testing against localhost, run `./test-locally`.

## Deployment

In order to deploy, execute `./deploy.sh <stage> <secrets-password> [<aws-profile>]`. 
- `stage` is only prod (right now)
- `<secrets-password>` is the password for `secrets.<stage>.yml.encrypted` file
- `aws-profile` is optional, specify it if you are not using default AWS profile
