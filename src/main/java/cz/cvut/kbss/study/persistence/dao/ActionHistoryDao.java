package cz.cvut.kbss.study.persistence.dao;

import cz.cvut.kbss.jopa.exceptions.NoResultException;
import cz.cvut.kbss.jopa.model.EntityManager;
import cz.cvut.kbss.study.model.ActionHistory;
import cz.cvut.kbss.study.model.User;
import cz.cvut.kbss.study.model.Vocabulary;
import cz.cvut.kbss.study.util.Constants;
import org.springframework.stereotype.Repository;

import java.net.URI;
import java.util.List;
import java.util.Objects;

@Repository
public class ActionHistoryDao extends OwlKeySupportingDao<ActionHistory>{

    public ActionHistoryDao() {
        super(ActionHistory.class);
    }

    public List<ActionHistory> findAllOrderByAsc(int pageNumber) {
        final EntityManager em = entityManager();
        try {
            return em.createNativeQuery("SELECT ?x WHERE { ?x a ?type; ?isCreated ?timestamp . } " +
                    "ORDER BY DESC(?timestamp)", ActionHistory.class)
                    .setParameter("type", typeUri)
                    .setParameter("isCreated", URI.create(Vocabulary.s_p_created))
                    .setFirstResult((pageNumber - 1) * Constants.ACTIONS_PER_PAGE)
                    .setMaxResults(Constants.ACTIONS_PER_PAGE + 1)
                    .getResultList();
        } catch (NoResultException e) {
            return null;
        } finally {
            em.close();
        }
    }

    public ActionHistory findByKey(String key) {
        Objects.requireNonNull(key);
        final EntityManager em = entityManager();
        try {
            ActionHistory action = em.createNativeQuery(
                    "SELECT ?x WHERE { ?x ?hasKey ?key . }", ActionHistory.class)
                    .setParameter("hasKey", URI.create(Vocabulary.s_p_key))
                    .setParameter("key", key, Constants.PU_LANGUAGE)
                    .getSingleResult();
            action.getPayload();
            return action;
        } catch (NoResultException e) {
            return null;
        } finally {
            em.close();
        }
    }

    public List<ActionHistory> findByType(String type, int pageNumber) {
        Objects.requireNonNull(type);
        final EntityManager em = entityManager();
        try {
            return em.createNativeQuery("SELECT ?x WHERE { ?x ?isType ?actionType; ?isCreated ?timestamp .} " +
                    "ORDER BY DESC(?timestamp)", ActionHistory.class)
                    .setParameter("isType", URI.create(Vocabulary.s_p_label))
                    .setParameter("actionType", type, Constants.PU_LANGUAGE)
                    .setParameter("isCreated", URI.create(Vocabulary.s_p_created))
                    .setFirstResult((pageNumber - 1) * Constants.ACTIONS_PER_PAGE)
                    .setMaxResults(Constants.ACTIONS_PER_PAGE + 1)
                    .getResultList();
        } catch (NoResultException e) {
            return null;
        } finally {
            em.close();
        }
    }

    public List<ActionHistory> findByAuthor(User author, int pageNumber) {
        Objects.requireNonNull(author);
        final EntityManager em = entityManager();
        try {
            return em.createNativeQuery("SELECT ?r WHERE { ?r a ?type ; ?hasOwner ?author; ?isCreated ?timestamp . } " +
                    "ORDER BY DESC(?timestamp)", ActionHistory.class)
                    .setParameter("type", typeUri)
                    .setParameter("hasOwner", URI.create(Vocabulary.s_p_has_owner))
                    .setParameter("isCreated", URI.create(Vocabulary.s_p_created))
                    .setParameter("author", author.getUri())
                    .setFirstResult((pageNumber - 1) * Constants.ACTIONS_PER_PAGE)
                    .setMaxResults(Constants.ACTIONS_PER_PAGE + 1)
                    .getResultList();
        } finally {
            em.close();
        }
    }

    public List<ActionHistory> findByTypeAndAuthor(String type, User author, int pageNumber) {
        Objects.requireNonNull(author);
        final EntityManager em = entityManager();
        try {
            return em.createNativeQuery("SELECT ?r WHERE { ?r a ?type ; ?isType ?actionType;  ?hasOwner ?author; ?isCreated ?timestamp . } " +
                    "ORDER BY DESC(?timestamp)", ActionHistory.class)
                    .setParameter("type", typeUri)
                    .setParameter("isType", URI.create(Vocabulary.s_p_label))
                    .setParameter("actionType", type, Constants.PU_LANGUAGE)
                    .setParameter("hasOwner", URI.create(Vocabulary.s_p_has_owner))
                    .setParameter("isCreated", URI.create(Vocabulary.s_p_created))
                    .setParameter("author", author.getUri())
                    .setFirstResult((pageNumber - 1) * Constants.ACTIONS_PER_PAGE)
                    .setMaxResults(Constants.ACTIONS_PER_PAGE + 1)
                    .getResultList();
        } finally {
            em.close();
        }
    }
}