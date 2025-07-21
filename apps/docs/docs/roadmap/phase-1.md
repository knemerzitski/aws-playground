---
sidebar_label: "Phase 1: Serverless"
sidebar_position: 1
---

# Phase 1

Basic serverless event-driven job pipeline.

## Stack

- DynamoDB for job storage
- Lambda for computation
- SQS for job queuing
- SNS for routing
- CloudWatch for metrics/logging

## Goals

- Microservice routing with SNS filtering
- Idempotent compute handlling
- Basic orchestration via status fields




