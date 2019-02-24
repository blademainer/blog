title: Einstein's Mass-Velocity Equation
date: 2019-02-24 16:59:49
category: physical
tags:
 - physical
 - "mass-velocity equation"
 - mass
 - equation
 - einstein
mathjax: true
---
# Physical Law
The mass 𝑚 of a body is not constant.

It varies with the body's velocity, according to the equation:

$$
m = \dfrac {m_0} {\sqrt{1 - \dfrac {v^2} {c^2} } }
$$

where:
- 𝑣 is the magnitude of the velocity of the body
- 𝑐 is the speed of light in vacuum
- 𝑚<sub>0</sub> is the rest mass of the body.

The value 𝑚 is known as the relativistic mass of the body.

The factor $\dfrac 1 {\sqrt{1 - \dfrac {v^2} {c^2} } }$ is known as the Lorentz Factor.

# Proof
Imagine a comet that flies towards a planet on which you are resting.

The comet's velocity 𝑢 towards the planet is much smaller than the speed of light.

Now imagine the impact caused by the comet striking the planet as a deformation of the planet.

That impact can be seen as proportional to the momentum of the comet which is:
$$
𝑝=𝑚𝑢
$$
where:
- 𝑝 is the magnitude of the comet's momentum
- 𝑚 is the comet's rest mass
- 𝑢 is the magnitude of the comet's velocity.

f someone else watches the crash from a space ship passing by with a relativistic velocity (for example 𝑣=0.7𝑐) he will find that the comet appears to move more slowly than it does from your stationary perspective on the planet.

This is due to the time dilation, which is given by:
$$
\Delta t' = \dfrac {\Delta t} {\sqrt{1 - \dfrac {v^2} {c^2}}}
$$

where:
- Δ𝑡′ is the time interval measured from the space ship
- Δ𝑡 is the time interval measured in the inertial system containing planet and comet
- 𝑣 is the magnitude of the space ship's velocity
- 𝑐 is the speed of light in vacuum.
Because the time measured in the space ship is less, the comet will appear to need more time to cover a certain distance.

Thus, its velocity seems smaller from the perspective of the space ship (Note: The space ship's trajectory be perpendicular to the comet's trajectory towards the planet, so there is no length contraction parallel to the trajectory of the comet).

The comet's velocity measured from the planet is:
$$
u = \dfrac {\mathrm d s} {\mathrm d t}
$$
where the comet's velocity measured from the space ship is:
$$
u' = \dfrac {\mathrm d s} {\mathrm d t'}
$$
and as we know from the time dilation, the term for 𝑢′ is thus:
$$
u' = u \sqrt{1 - \frac {v^2}{c^2}}
$$
The observer in the space ship will nevertheless find out that the impact is equal to the one observed by the resting person.

That means that the comet's momentum doesn't change, no matter from what inertial system you measure it.

That can only be possible, if -- seen from the space ship -- the comet's mass increases, as its velocity decreases.

The comet's momentum from the perspective of the space ship is:
$$
p' = m' u'
$$
where:
- 𝑝′ is the magnitude of the comet's momentum measured from the inertial system of the space ship
- 𝑚′ is the comet's relativistic mass measured from the inertial system of the space ship
- 𝑢′ is the magnitude of the comet's velocity measured from the inertial system of the space ship.
And because the measured momentums from both observers are the same, you can write:
$$
p = p'
$$

$$
m u = m' u'
$$

$$
m' = m \dfrac u {u'}
$$

$$
m' = m \dfrac u {u \sqrt{1 - \frac {v^2} {c^2}}}
$$

$$
m' = \dfrac m {\sqrt{1 - \frac {v^2} {c^2}}}
$$

# Sources
- 1972: [George F. Simmons](https://proofwiki.org/wiki/Mathematician:George_F._Simmons): [Differential Equations](https://proofwiki.org/wiki/Book:George_F._Simmons/Differential_Equations) ... ([previous](https://proofwiki.org/wiki/Definition:Burnout_Height)) ... ([next](https://proofwiki.org/wiki/Einstein%27s_Mass-Energy_Equation)): Miscellaneous Problems for Chapter 2: Problem 32
- 1992: [George F. Simmons](https://proofwiki.org/wiki/Mathematician:George_F._Simmons): [Calculus Gems](https://proofwiki.org/wiki/Book:George_F._Simmons/Calculus_Gems) ... ([previous](https://proofwiki.org/wiki/Definition:Linear_Momentum)) ... ([next](https://proofwiki.org/wiki/Einstein%27s_Law_of_Motion)): Chapter B.7: A Simple Approach to $E = M c^2$
