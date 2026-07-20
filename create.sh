#!/usr/bin/expect -f
set timeout -1
spawn pnpm dlx create-solid@latest -p solid-temp -s --ts
expect "Which version of SolidStart?"
send "\r"
expect "Which template would you like to use?"
send "\r"
expect "Server Side Rendering?"
send "\r"
expect eof
