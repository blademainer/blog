title: plantuml示例
date: 2019-01-24 17:09:19
category: tools
tags:
 - plantuml
 - demo
---

plantuml使用示例
<!--more-->

{% plantuml %}
Alice -> Bob: Authentication Request
Bob --> Alice: Authentication Response

Alice -> Bob: Another authentication Request
Alice <-- Bob: another authentication Response
{% endplantuml %}

{% plantuml %}
Alice -> Bob: Authentication Request
actor Foo1
boundary Foo2
control Foo3
entity Foo4
database Foo5
collections Foo6
Foo1 -> Foo2 : To boundary
Foo1 -> Foo3 : To control
Foo1 -> Foo4 : To entity
Foo1 -> Foo5 : To database
Foo1 -> Foo6 : To collections
{% endplantuml %}


{% plantuml %}
Bob ->x Alice
Bob -> Alice
Bob ->> Alice
Bob -\ Alice
Bob \\- Alice
Bob //-- Alice

Bob ->o Alice
Bob o\\-- Alice

Bob <-> Alice
Bob <->o Alice
{% endplantuml %}

{% plantuml %}
Alice -> Bob: Authentication Request

alt successful case

	Bob -> Alice: Authentication Accepted
	
else some kind of failure

	Bob -> Alice: Authentication Failure
	group My own label
		Alice -> Log : Log attack start
	    loop 1000 times
	        Alice -> Bob: DNS Attack
	    end
		Alice -> Log : Log attack end
	end
	
else Another type of failure

   Bob -> Alice: Please repeat
   
end
{% endplantuml %}

{% plantuml %}
skinparam backgroundColor #EEEBDC
skinparam handwritten true

skinparam sequence {
	ArrowColor DeepSkyBlue
	ActorBorderColor DeepSkyBlue
	LifeLineBorderColor blue
	LifeLineBackgroundColor #A9DCDF
	
	ParticipantBorderColor DeepSkyBlue
	ParticipantBackgroundColor DodgerBlue
	ParticipantFontName Impact
	ParticipantFontSize 17
	ParticipantFontColor #A9DCDF
	
	ActorBackgroundColor aqua
	ActorFontColor DeepSkyBlue
	ActorFontSize 17
	ActorFontName Aapex
}

actor User
participant "First Class" as A
participant "Second Class" as B
participant "Last Class" as C

User -> A: DoWork
activate A

A -> B: Create Request
activate B

B -> C: DoWork
activate C
C --> B: WorkDone
destroy C

B --> A: Request Created
deactivate B

A --> User: Done
deactivate A
{% endplantuml %}

{% plantuml %}
skinparam ParticipantPadding 20
skinparam BoxPadding 10

box "Foo1"
participant Alice1
participant Alice2
end box
box "Foo2"
participant Bob1
participant Bob2
end box
Alice1 -> Bob1 : hello
Alice1 -> Out : out
{% endplantuml %}


# activity
{% plantuml %}
title Servlet Container

(*) --> "ClickServlet.handleRequest()"
--> "new Page"

if "Page.onSecurityCheck" then
  ->[true] "Page.onInit()"
  
  if "isForward?" then
   ->[no] "Process controls"
   
   if "continue processing?" then
	 -->[yes] ===RENDERING===
   else
	 -->[no] ===REDIRECT_CHECK===
   endif
   
  else
   -->[yes] ===RENDERING===
  endif
  
  if "is Post?" then
	-->[yes] "Page.onPost()"
	--> "Page.onRender()" as render
	--> ===REDIRECT_CHECK===
  else
	-->[no] "Page.onGet()"
	--> render
  endif
  
else
  -->[false] ===REDIRECT_CHECK===
endif

if "Do redirect?" then
 ->[yes] "redirect request"
 --> ==BEFORE_DESTROY===
else
 if "Do Forward?" then
  -left->[yes] "Forward request"
  --> ==BEFORE_DESTROY===
 else
  -right->[no] "Render page template"
  --> ==BEFORE_DESTROY===
 endif
endif

--> "Page.onDestroy()"
-->(*)

{% endplantuml %}

{% plantuml %}
partition Conductor {
  (*) --> "Climbs on Platform"
  --> === S1 ===
  --> Bows
}

partition Audience #LightSkyBlue {
  === S1 === --> Applauds
}

partition Conductor {
  Bows --> === S2 ===
  --> WavesArmes
  Applauds --> === S2 ===
}

partition Orchestra #CCCCEE {
  WavesArmes --> Introduction
  --> "Play music"
}
{% endplantuml %}

{% plantuml %}
start
:ClickServlet.handleRequest();
:new page;
if (Page.onSecurityCheck) then (true)
  :Page.onInit();
  if (isForward?) then (no)
	:Process controls;
	if (continue processing?) then (no)
	  stop
	endif
	
	if (isPost?) then (yes)
	  :Page.onPost();
	else (no)
	  :Page.onGet();
	endif
	:Page.onRender();
  endif
else (false)
endif

if (do redirect?) then (yes)
  :redirect process;
else
  if (do forward?) then (yes)
	:Forward request;
  else (no)
	:Render page template;
  endif
endif

stop
{% endplantuml %}

# Archimate
{% plantuml %}
sprite $bProcess jar:archimate/business-process
sprite $aService jar:archimate/application-service
sprite $aComponent jar:archimate/application-component

archimate #Business "Handle claim"  as HC <<business-process>>
archimate #Business "Capture Information"  as CI <<business-process>>
archimate #Business "Notify\nAdditional Stakeholders" as NAS <<business-process>>
archimate #Business "Validate" as V <<business-process>>
archimate #Business "Investigate" as I <<business-process>>
archimate #Business "Pay" as P <<business-process>>

HC *-down- CI
HC *-down- NAS
HC *-down- V
HC *-down- I
HC *-down- P

CI -right->> NAS
NAS -right->> V
V -right->> I
I -right->> P

archimate #APPLICATION "Scanning" as scanning <<application-service>>
archimate #APPLICATION "Customer admnistration" as customerAdministration <<application-service>>
archimate #APPLICATION "Claims admnistration" as claimsAdministration <<application-service>>
archimate #APPLICATION Printing  <<application-service>>
archimate #APPLICATION Payment  <<application-service>>

scanning -up-> CI
customerAdministration  -up-> CI
claimsAdministration -up-> NAS
claimsAdministration -up-> V
claimsAdministration -up-> I
Payment -up-> P

Printing -up-> V
Printing -up-> P

archimate #APPLICATION "Document\nManagement\nSystem" as DMS <<application-component>>
archimate #APPLICATION "General\nCRM\nSystem" as CRM <<application-component>>
archimate #APPLICATION "Home & Away\nPolicy\nAdministration" as HAPA <<application-component>>
archimate #APPLICATION "Home & Away\nFinancial\nAdministration" as HFPA <<application-component>>

DMS .up.|> scanning
DMS .up.|> Printing
CRM .up.|> customerAdministration
HAPA .up.|> claimsAdministration
HFPA .up.|> Payment

legend left
Example from the "Archisurance case study" (OpenGroup).
See 
==
<$bProcess> :business process
==
<$aService> : application service
==
<$aComponent> : application component
endlegend
{% endplantuml %}

# Class
{% plantuml %}
' Split into 4 pages
page 2x2
skinparam pageMargin 10
skinparam pageExternalColor gray
skinparam pageBorderColor black

class BaseClass

namespace net.dummy #DDDDDD {
	.BaseClass <|-- Person
	Meeting o-- Person
	
	.BaseClass <|- Meeting

}

namespace net.foo {
  net.dummy.Person  <|- Person
  .BaseClass <|-- Person

  net.dummy.Meeting o-- Person
}

BaseClass <|-- net.unused.Person
{% endplantuml %}


# Deploy
{% plantuml %}
node node1
node node2
node node3
node node4
node node5
node1 -- node2
node1 .. node3
node1 ~~ node4
node1 == node5
{% endplantuml %}

{% plantuml %}
left to right direction
frame user1{
card root
card sub1
card sub2
}

card leaf1
card leaf2

root-->sub1
root-->sub2
sub1-->leaf1
sub1-->leaf2
{% endplantuml %}

{% plantuml %}
skinparam rectangle {
	roundCorner<<Concept>> 25
}

rectangle "Concept Model" <<Concept>> {
	rectangle "Example 1" <<Concept>> as ex1
	rectangle "Another rectangle"
}
{% endplantuml %}

# Gantt
{% plantuml %}
[Prototype design] lasts 15 days
[Test prototype] lasts 10 days
{% endplantuml %}

{% plantuml %}
[Prototype design] lasts 15 days
[Test prototype] lasts 10 days
[Test prototype] starts at [Prototype design]'s end
{% endplantuml %}

{% plantuml %}
[Prototype design] lasts 10 days
[Code prototype] lasts 10 days
[Write tests] lasts 5 days
[Code prototype] starts at [Prototype design]'s end
[Write tests] starts at [Code prototype]'s start
{% endplantuml %}


{% plantuml %}
[Prototype design] lasts 13 days
[Test prototype] lasts 4 days
[Test prototype] starts at [Prototype design]'s end
[Prototype design] is colored in Fuchsia/FireBrick 
[Test prototype] is colored in GreenYellow/Green 
{% endplantuml %}

{% plantuml %}
[Test prototype] lasts 10 days
[Prototype completed] happens at [Test prototype]'s end
[Setup assembly line] lasts 12 days
[Setup assembly line] starts at [Test prototype]'s end

{% endplantuml %}

{% plantuml %}
Project starts the 20th of september 2017
[Prototype design] as [TASK1] lasts 13 days
[TASK1] is colored in Lavender/LightBlue
{% endplantuml %}


{% plantuml %}
project starts the 2018/04/09
saturday are closed
sunday are closed
2018/05/01 is closed
2018/04/17 to 2018/04/19 is closed
[Prototype design] lasts 14 days
[Test prototype] lasts 4 days
[Test prototype] starts at [Prototype design]'s end
[Prototype design] is colored in Fuchsia/FireBrick 
[Test prototype] is colored in GreenYellow/Green 
{% endplantuml %}

{% plantuml %}
[Prototype design] lasts 14 days
then [Test prototype] lasts 4 days
then [Deploy prototype] lasts 6 days
{% endplantuml %}


{% plantuml %}
[Prototype design] lasts 14 days
[Build prototype] lasts 4 days
[Prepare test] lasts 6 days
[Prototype design] -> [Build prototype]
[Prototype design] -> [Prepare test]
{% endplantuml %}


{% plantuml %}
[Group1/Group1 Task1] lasts 5 days and is colored in Fuchsia/FireBrick
[Group2/Group2 Task1] lasts 7 days and is colored in GreenYellow/Green
[Group2/Group2 Task2] lasts 5 days and is colored in GreenYellow/Green
[Group1/Group1 Task2] lasts 7 days and is colored in Fuchsia/FireBrick
{% endplantuml %}


{% plantuml %}
[Task1] lasts 10 days
then [Task2] lasts 4 days
-- Phase Two --
then [Task3] lasts 5 days
then [Task4] lasts 6 days
{% endplantuml %}


{% plantuml %}
[Task1] on {Alice} lasts 10 days
[Task2] on {Bob} lasts 2 days at 50% 
then [Task3] on {Alice} lasts 1 days at 25%
{% endplantuml %}


{% plantuml %}
[Prototype design] lasts 13 days and is colored in Lavender/LightBlue
[Test prototype] lasts 9 days and is colored in Coral/Green and starts 3 days after [Prototype design]'s end
[Write tests] lasts 5 days and ends at [Prototype design]'s end
[Hire tests writers] lasts 6 days and ends at [Write tests]'s start
[Init and write tests report] is colored in Coral/Green
[Init and write tests report] starts 1 day before [Test prototype]'s start and ends at [Test prototype]'s end
{% endplantuml %}


# UseCase
{% plantuml %}
:Main Admin: as Admin
(Use the application) as (Use)

User -> (Start)
User --> (Use)

Admin ---> (Use)

note right of Admin : This is an example.

note right of (Use)
  A note can also
  be on several lines
end note

note "This note is connected\nto several objects." as N2
(Start) .. N2
N2 .. (Use)
{% endplantuml %}


{% plantuml %}
User << Human >>
:Main Database: as MySql << Application >>
(Start) << One Shot >>
(Use the application) as (Use) << Main >>

User -> (Start)
User --> (Use)

MySql --> (Use)
{% endplantuml %}

# Timing
{% plantuml %}
robust "Web 浏览器" as WB
concise "Web 用户" as WU

@0
WU is 空闲
WB is 空闲

@100
WU is 等待中
WB is 处理中

@300
WB is 等待中
{% endplantuml %}



{% plantuml %}
robust "DNS Resolver" as DNS
robust "Web Browser" as WB
concise "Web User" as WU

@0
WU is Idle
WB is Idle
DNS is Idle

@+100
WU -> WB : URL
WU is Waiting
WB is Processing

@+200
WB is Waiting
WB -> DNS@+50 : Resolve URL

@+100
DNS is Processing

@+300
DNS is Idle
{% endplantuml %}


{% plantuml %}
robust "Web Browser" as WB
concise "Web User" as WU

@WB
0 is idle
+200 is Proc.
+100 is Waiting

@WU
0 is Waiting
+500 is ok
{% endplantuml %}


{% plantuml %}
concise "Web User" as WU
scale 100 as 50 pixels

@WU
0 is Waiting
+500 is ok
{% endplantuml %}


{% plantuml %}
robust "Web Browser" as WB
concise "Web User" as WU

WB is Initializing
WU is Absent

@WB
0 is idle
+200 is Processing
+100 is Waiting

@WU
0 is Waiting
+500 is ok
{% endplantuml %}


{% plantuml %}
robust "Web Browser" as WB
concise "Web User" as WU

WB is Initializing
WU is Absent

@WB
0 is idle
+200 is Processing
+100 is Waiting
WB@0 <-> @50 : {50 ms lag}

@WU
0 is Waiting
+500 is ok
@200 <-> @+150 : {150 ms}
{% endplantuml %}


{% plantuml %}
Title this is my title
header: some header
footer: some footer
legend
Some legend
end legend
caption some caption

robust "Web Browser" as WB
concise "Web User" as WU

@0
WU is Idle
WB is Idle

@100
WU is Waiting
WB is Processing

@300
WB is Waiting
{% endplantuml %}


