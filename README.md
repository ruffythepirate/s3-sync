# Introduction

This is a library that aims at implementing the sync logic supplied by the AWS CLI. Such functionality already exists in the `s3` library, but because that library is seemingly becoming old, created conflicts in my tests and have no tests, this is an attempt to rewrite some of this library. Note that it is work in progress, in will probably for quite some time miss functionality.

# Roadmap

1. Implement sync from local drive to s3, without multipart support or support for special flags.
