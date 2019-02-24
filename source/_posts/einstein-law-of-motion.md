title: Einstein's Law of Motion 
date: 2019-02-24 17:22:28
category: physical
tags:
 - physical
 - "law of motion"
 - law
 - montion
 - einstein
mathjax: true
---

# Physical Law
The force and acceleration on a body of constant rest mass are related by the equation:
$$
\mathbf F = \dfrac {m_0 \mathbf a} {\left({1 - \dfrac{v^2}{c^2}}\right)^{\tfrac 3 2}}
$$
where:
- 𝐅 is the force on the body
- 𝐚 is the acceleration induced on the body
- 𝑣 is the magnitude of the velocity of the body
- 𝑐 is the speed of light
- 𝑚<sub>0</sub> is the rest mass of the body.

# Proof
Into Newton's Second Law of Motion:
$$
\mathbf F = \dfrac {\mathrm d}{\mathrm d t} \left({m \mathbf v}\right)
$$

we substitute Einstein's Mass-Velocity Equation:
$$
m = \dfrac {m_0} {\sqrt {1 - \dfrac {v^2} {c^2}}}
$$
where:
- 𝑣 is the magnitude of the velocity of the body
- 𝑐 is the speed of light in vacuum
- 𝑚<sub>0</sub> is the rest mass of the body.

The value 𝑚 is known as the relativistic mass of the body.
The factor $\dfrac 1 {\sqrt{1 - \dfrac {v^2} {c^2} } }$ is known as the Lorentz Factor.

to obtain:
$$
\mathbf F = \dfrac {\mathrm d} {\mathrm d t} \left({\dfrac {m_0 \mathbf v}{\sqrt{1 - \dfrac {v^2}{c^2}}}}\right)
$$

Then we perform the differentiation with respect to time:

$$\frac{\mathrm d}{\mathrm d t} \left({\frac {\mathbf v}{\sqrt{1 - \dfrac {v^2}{c^2} } } }\right)$$ $$ = \frac{\mathrm d}{\mathrm d v} \left({\frac {\mathbf v}{\sqrt{1 - \dfrac {v^2}{c^2} } } }\right) \frac{\mathrm d v}{\mathrm d t} $$
$$ = \mathbf a \left({\frac {\sqrt{1 - \dfrac {v^2}{c^2} } - \dfrac v 2 \dfrac 1 {\sqrt{1 - \dfrac {v^2}{c^2} } } \dfrac{-2 v}{c^2} } {1 - \dfrac {v^2}{c^2} } }\right) $$
$$ = \mathbf a \left({\frac {c^2 \left({1 - \dfrac {v^2}{c^2} }\right) + v^2} {c^2 \left({1 - \dfrac {v^2}{c^2} }\right)^{3/2} } }\right) $$
$$ = \mathbf a \left({\frac 1 {\left({1 - \dfrac {v^2}{c^2} }\right)^{3/2} } }\right)$$

Thus we arrive at the form:
$$
\mathbf F = \dfrac {m_0 \mathbf a} {\left({1 - \dfrac{v^2}{c^2}}\right)^{\tfrac 3 2}}
$$


# Sources
- 1992: [George F. Simmons](https://proofwiki.org/wiki/Mathematician:George_F._Simmons): [Calculus Gems](https://proofwiki.org/wiki/Book:George_F._Simmons/Calculus_Gems) ... ([previous](https://proofwiki.org/wiki/Definition:Linear_Momentum)) ... ([next](https://proofwiki.org/wiki/Einstein%27s_Law_of_Motion)): Chapter B.7: A Simple Approach to $E = M c^2$


